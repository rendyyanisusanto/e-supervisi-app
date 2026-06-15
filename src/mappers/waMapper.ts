export class WaMapper {
  static templateToFrontend(apiTemplate: any) {
    if (!apiTemplate) return {} as any;
    return {
      id: String(apiTemplate.id),
      code: apiTemplate.code,
      name: apiTemplate.name,
      description: apiTemplate.description,
      category: apiTemplate.category,
      content: apiTemplate.content,
      isActive: apiTemplate.is_active,
    };
  }

  static templateToApiPayload(frontendTemplate: any) {
    return {
      code: frontendTemplate.code,
      name: frontendTemplate.name,
      description: frontendTemplate.description,
      category: frontendTemplate.category,
      content: frontendTemplate.content,
      is_active: frontendTemplate.isActive,
    };
  }
}
