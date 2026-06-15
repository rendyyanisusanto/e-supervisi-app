export class InstrumentMapper {
  static toFrontendItem(apiItem: any) {
    if (!apiItem) return {} as any;
    return {
      id: String(apiItem.id),
      instrumentId: String(apiItem.instrument_id),
      category: apiItem.category,
      code: apiItem.code,
      description: apiItem.description,
      maxScore: apiItem.max_score,
      sortOrder: apiItem.sort_order,
      isActive: apiItem.is_active,
    };
  }

  static toApiItemPayload(frontendItem: any) {
    return {
      category: frontendItem.category,
      code: frontendItem.code,
      description: frontendItem.description,
      max_score: frontendItem.maxScore,
      sort_order: frontendItem.sortOrder,
      is_active: frontendItem.isActive,
    };
  }

  static toFrontend(apiInstrument: any) {
    if (!apiInstrument) return {} as any;
    return {
      id: String(apiInstrument.id),
      code: apiInstrument.code,
      name: apiInstrument.name,
      type: apiInstrument.type,
      description: apiInstrument.description,
      isActive: apiInstrument.is_active,
      itemsCount: apiInstrument.items_count || 0,
      items: apiInstrument.items ? apiInstrument.items.map((i: any) => InstrumentMapper.toFrontendItem(i)) : [],
    };
  }

  static toApiPayload(frontendInstrument: any) {
    return {
      code: frontendInstrument.code,
      name: frontendInstrument.name,
      type: frontendInstrument.type,
      description: frontendInstrument.description,
      is_active: frontendInstrument.isActive,
    };
  }
}
