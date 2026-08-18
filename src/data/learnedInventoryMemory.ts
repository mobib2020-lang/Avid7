import { AssetClassification, AssetRequirementField, EquipmentItem, ItemKind } from '../types';
import { RAW_EQUIPMENT_CATALOG, EquipmentProductReference, resolveTaxonomyForProduct } from './equipmentCatalogProducts';
import { INITIAL_STRUCTURES_DATA, getInheritedFieldsForNode } from './assetTaxonomyData';

export type InventoryItemSource = 'system_standard' | 'user_custom' | 'agent_learned';

export interface LearnedInventoryItem {
  id: string;
  name: string; // نام فارسی قلم موجودی
  enName?: string; // نام انگلیسی
  category: string; // رده اصلی (Category)
  subcategory: string; // زیردسته (Subcategory)
  type: string; // نوع موجودی (Type)
  classificationPath?: string; // مسیر سلسله‌مراتبی
  itemKind: ItemKind; // نوع: دستگاه سرمایه‌ای یا قلم مصرفی
  defaultUnit?: string; // واحد پیش‌فرض (دستگاه، عدد، بسته و...)
  defaultBrand?: string; // برند پیش‌فرض
  defaultModel?: string; // مدل پیش‌فرض
  umdns?: string;
  usageCount: number; // تعداد دفعات ثبت / استفاده جهت رتبه‌بندی حافظه
  lastUsedAt: string; // تاریخ آخرین ثبت
  sourceType: InventoryItemSource; // منبع داده در پشت صحنه (برای مدیریت داخلی سیستم)
  isLearned?: boolean; // آیا توسط سیستم یا کاربر یادگیری/اضافه شده است
  sampleCodePrefix?: string;
  defaultSpecs?: Record<string, string>;
}

const STORAGE_KEY = 'avid_learned_inventory_memory_v3';

/**
 * Normalizes Persian string for consistent matching (removes half-spaces, standardizes ی and ک).
 */
export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200C\u200B\u200E\u200F]/g, ' ') // replace ZWNJ with space for matching
    .replace(/\s+/g, ' ');
}

/**
 * Builds the initial memory list from the master reference catalog and initial hospital assets.
 */
function buildInitialMemoryCatalog(): LearnedInventoryItem[] {
  const catalogList: LearnedInventoryItem[] = RAW_EQUIPMENT_CATALOG
    .filter(
      (p) =>
        p.category !== 'تجهیزات دندانپزشکی' &&
        !p.category.includes('دندان') &&
        !p.subcategory.includes('دندان')
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      enName: p.enName,
      category: p.category,
      subcategory: p.subcategory,
      type: p.type,
      classificationPath: `${p.category} ❯ ${p.subcategory} ❯ ${p.type}`,
      itemKind: p.itemKind || 'device',
      defaultUnit: p.defaultUnit || (p.itemKind === 'consumable' ? 'عدد' : 'دستگاه'),
      umdns: p.umdns,
      usageCount: 1,
      lastUsedAt: '۱۴۰۳/۱۱/۲۰',
      sourceType: 'system_standard',
      isLearned: false,
    }));

  return catalogList;
}

/**
 * Retrieves the live learned memory catalog from localStorage (or initializes if empty).
 */
export function getLearnedInventoryCatalog(): LearnedInventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback if localStorage fails
  }

  const initial = buildInitialMemoryCatalog();
  saveCatalogToStorage(initial);
  return initial;
}

/**
 * Internal helper to save the full catalog list to localStorage.
 */
function saveCatalogToStorage(catalog: LearnedInventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  } catch (err) {
    console.warn('Failed to persist learned inventory memory to localStorage', err);
  }
}

/**
 * Searches the learned memory catalog with intelligent ranking:
 * - Exact name matches first
 * - Frequently used items (usageCount > 1) boosted
 * - Partial matches on name, english name, subcategory, and type
 */
export function searchLearnedInventory(
  query: string,
  categoryFilter?: string,
  catalog: LearnedInventoryItem[] = getLearnedInventoryCatalog()
): LearnedInventoryItem[] {
  const normQuery = normalizePersianText(query);
  let filtered = catalog;

  if (categoryFilter && categoryFilter !== 'all') {
    if (categoryFilter === 'consumable') {
      filtered = filtered.filter((i) => i.itemKind === 'consumable');
    } else if (categoryFilter === 'medical') {
      filtered = filtered.filter((i) => i.category === 'تجهیزات پزشکی');
    } else if (categoryFilter === 'laboratory') {
      filtered = filtered.filter((i) => i.category === 'تجهیزات آزمایشگاهی');
    } else if (categoryFilter === 'hospital') {
      filtered = filtered.filter((i) => i.category === 'تجهیزات بیمارستانی');
    } else if (categoryFilter === 'general_hospital' || categoryFilter === 'support') {
      filtered = filtered.filter((i) => i.category === 'اموال عمومی و پشتیبانی بیمارستان');
    } else {
      filtered = filtered.filter(
        (i) =>
          normalizePersianText(i.category) === normalizePersianText(categoryFilter) ||
          normalizePersianText(i.subcategory) === normalizePersianText(categoryFilter)
      );
    }
  }

  if (!normQuery) {
    // Return sorted by usageCount and then recency
    return [...filtered].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  }

  const matches = filtered.filter((item) => {
    const nName = normalizePersianText(item.name);
    const nEn = (item.enName || '').toLowerCase();
    const nSub = normalizePersianText(item.subcategory);
    const nType = normalizePersianText(item.type);
    const nCat = normalizePersianText(item.category);
    const nUmdns = item.umdns || '';

    return (
      nName.includes(normQuery) ||
      nEn.includes(normQuery.toLowerCase()) ||
      nSub.includes(normQuery) ||
      nType.includes(normQuery) ||
      nCat.includes(normQuery) ||
      nUmdns.includes(normQuery)
    );
  });

  // Rank matches:
  return matches.sort((a, b) => {
    const normA = normalizePersianText(a.name);
    const normB = normalizePersianText(b.name);

    // Exact matches
    const aExact = normA === normQuery ? 100 : normA.startsWith(normQuery) ? 50 : 0;
    const bExact = normB === normQuery ? 100 : normB.startsWith(normQuery) ? 50 : 0;

    const aScore = aExact + (a.usageCount || 1) * 2 + (a.isLearned ? 10 : 0);
    const bScore = bExact + (b.usageCount || 1) * 2 + (b.isLearned ? 10 : 0);

    return bScore - aScore;
  });
}

/**
 * Checks if an item with the given name exists in the catalog (exact or high-similarity match).
 */
export function findLearnedItemByName(
  name: string,
  catalog: LearnedInventoryItem[] = getLearnedInventoryCatalog()
): LearnedInventoryItem | undefined {
  if (!name || !name.trim()) return undefined;
  const norm = normalizePersianText(name);
  return catalog.find((item) => normalizePersianText(item.name) === norm);
}

/**
 * Registers / Updates an item in the persistent learned memory catalog.
 * If the item already exists, its usageCount is incremented and fields updated.
 * If new, it is added to the memory with isLearned: true.
 */
export function recordAndLearnInventoryItem(
  itemData: {
    name: string;
    enName?: string;
    category: string;
    subcategory: string;
    type: string;
    itemKind?: ItemKind;
    defaultUnit?: string;
    defaultBrand?: string;
    defaultModel?: string;
    umdns?: string;
    sourceType?: InventoryItemSource;
    specs?: Record<string, string>;
  }
): LearnedInventoryItem {
  const catalog = getLearnedInventoryCatalog();
  const normName = normalizePersianText(itemData.name);

  const existingIndex = catalog.findIndex(
    (item) => normalizePersianText(item.name) === normName
  );

  const todayShamsi = new Intl.DateTimeFormat('fa-IR').format(new Date());

  if (existingIndex >= 0) {
    const existing = catalog[existingIndex];
    const updated: LearnedInventoryItem = {
      ...existing,
      category: itemData.category || existing.category,
      subcategory: itemData.subcategory || existing.subcategory,
      type: itemData.type || existing.type,
      classificationPath: `${itemData.category || existing.category} ❯ ${itemData.subcategory || existing.subcategory} ❯ ${itemData.type || existing.type}`,
      enName: itemData.enName || existing.enName,
      itemKind: itemData.itemKind || existing.itemKind || 'device',
      defaultUnit: itemData.defaultUnit || existing.defaultUnit,
      defaultBrand: itemData.defaultBrand || existing.defaultBrand,
      defaultModel: itemData.defaultModel || existing.defaultModel,
      umdns: itemData.umdns || existing.umdns,
      usageCount: (existing.usageCount || 0) + 1,
      lastUsedAt: todayShamsi,
      sourceType: existing.sourceType || itemData.sourceType || 'user_custom',
      defaultSpecs: { ...(existing.defaultSpecs || {}), ...(itemData.specs || {}) },
    };

    catalog[existingIndex] = updated;
    saveCatalogToStorage(catalog);
    return updated;
  } else {
    const newItem: LearnedInventoryItem = {
      id: `learned-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: itemData.name.trim(),
      enName: itemData.enName?.trim() || '',
      category: itemData.category.trim(),
      subcategory: itemData.subcategory.trim(),
      type: itemData.type.trim(),
      classificationPath: `${itemData.category.trim()} ❯ ${itemData.subcategory.trim()} ❯ ${itemData.type.trim()}`,
      itemKind: itemData.itemKind || 'device',
      defaultUnit: itemData.defaultUnit || (itemData.itemKind === 'consumable' ? 'عدد' : 'دستگاه'),
      defaultBrand: itemData.defaultBrand || '',
      defaultModel: itemData.defaultModel || '',
      umdns: itemData.umdns || '',
      usageCount: 1,
      lastUsedAt: todayShamsi,
      sourceType: itemData.sourceType || 'user_custom',
      isLearned: true,
      defaultSpecs: itemData.specs || {},
    };

    catalog.unshift(newItem); // put at top
    saveCatalogToStorage(catalog);
    return newItem;
  }
}

/**
 * Synchronizes the entire hospital equipment list with the learned memory catalog.
 * Ensures any item already in inventory is learned by the memory engine.
 */
export function syncExistingInventoryWithMemory(
  equipmentList: EquipmentItem[]
): void {
  if (!equipmentList || equipmentList.length === 0) return;

  const catalog = getLearnedInventoryCatalog();
  let modified = false;

  for (const eq of equipmentList) {
    if (!eq.faName || !eq.category) continue;
    const norm = normalizePersianText(eq.faName);
    const existing = catalog.find((item) => normalizePersianText(item.name) === norm);

    if (!existing) {
      const newItem: LearnedInventoryItem = {
        id: `learned-eq-${eq.id}`,
        name: eq.faName.trim(),
        enName: eq.enName?.trim() || '',
        category: eq.category.trim(),
        subcategory: eq.subcategory?.trim() || '',
        type: eq.type?.trim() || '',
        classificationPath: eq.classificationPath || `${eq.category}${eq.subcategory ? ' ❯ ' + eq.subcategory : ''}${eq.type ? ' ❯ ' + eq.type : ''}`,
        itemKind: eq.itemKind || 'device',
        defaultUnit: eq.unit || 'دستگاه',
        defaultBrand: eq.brand || '',
        defaultModel: eq.model || '',
        usageCount: 1,
        lastUsedAt: eq.createdAt || '۱۴۰۳/۱۱/۲۰',
        sourceType: 'agent_learned',
        isLearned: true,
        defaultSpecs: eq.specs || {},
      };
      catalog.push(newItem);
      modified = true;
    } else {
      // update category if missing
      if (!existing.subcategory && eq.subcategory) {
        existing.subcategory = eq.subcategory;
        existing.classificationPath = `${existing.category} ❯ ${eq.subcategory} ❯ ${existing.type || ''}`;
        modified = true;
      }
      if (!existing.type && eq.type) {
        existing.type = eq.type;
        existing.classificationPath = `${existing.category} ❯ ${existing.subcategory || ''} ❯ ${eq.type}`;
        modified = true;
      }
    }
  }

  if (modified) {
    saveCatalogToStorage(catalog);
  }
}

/**
 * Helper to resolve the taxonomy classification node and inherited requirement fields
 * for a learned item or selected category/subcategory/type.
 */
export function resolveTaxonomyForLearnedItem(
  item: {
    category: string;
    subcategory?: string;
    type?: string;
  },
  classificationsList: AssetClassification[] = INITIAL_STRUCTURES_DATA
): {
  categoryNode?: AssetClassification;
  subcategoryNode?: AssetClassification;
  typeNode?: AssetClassification;
  inheritedFields: { levelLabel: string; field: AssetRequirementField }[];
} {
  const normCat = normalizePersianText(item.category);
  const normSub = normalizePersianText(item.subcategory || '');
  const normType = normalizePersianText(item.type || '');

  // 1. Find category node
  const categoryNode = classificationsList.find(
    (c) => !c.parentId && normalizePersianText(c.name) === normCat
  );

  // 2. Find subcategory node
  const subcategoryNode = classificationsList.find(
    (c) =>
      (categoryNode ? c.parentId === categoryNode.id : true) &&
      normalizePersianText(c.name) === normSub
  );

  // 3. Find type node
  const typeNode = classificationsList.find(
    (c) =>
      (subcategoryNode ? c.parentId === subcategoryNode.id : true) &&
      normalizePersianText(c.name) === normType
  );

  const targetNodeId = typeNode?.id || subcategoryNode?.id || categoryNode?.id || '';
  const inheritedFields = targetNodeId
    ? getInheritedFieldsForNode(targetNodeId, classificationsList)
    : [];

  return {
    categoryNode,
    subcategoryNode,
    typeNode,
    inheritedFields,
  };
}
