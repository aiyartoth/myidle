/**
 * 宠物控制管理：宠物生成、实例管理
 */
import type { PetTemplate, PetRuntime, PetSkillSlot } from "../types/pet.types";

export interface PetControllerOptions {
  /** 宠物模板表（按 templateId 查找） */
  petTemplateTable?: Map<string, PetTemplate>;
}

export interface GeneratePetOptions {
  /** 初始可分配属性点，默认 0 */
  initialStatPoints?: number;
  /** 覆盖名称 */
  name?: string;
  /** 覆盖基础属性（与模板合并，同 key 以此处为准） */
  baseAttrs?: Partial<PetRuntime["baseAttrs"]>;
  /** 初始装备技能（不传则从模板 skillIds 生成空槽，或 []） */
  initialSkills?: PetSkillSlot[];
}

/** 生成宠物实例 id 的简单实现 */
function nextPetId(): string {
  return `pet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class PetController {
  private petTemplateTable: Map<string, PetTemplate>;

  constructor(options: PetControllerOptions = {}) {
    this.petTemplateTable = options.petTemplateTable ?? new Map();
  }

  /**
   * 注册宠物模板（便于按 id 生成）
   */
  registerTemplate(template: PetTemplate): void {
    this.petTemplateTable.set(template.id, template);
  }

  /**
   * 根据模板 id 生成一只宠物实例
   * @param templateId 宠物模板 id
   * @param options 可选：初始属性点、覆盖名称/属性、初始技能
   * @returns 宠物运行时数据，模板不存在时返回 null
   */
  generatePet(
    templateId: string,
    options: GeneratePetOptions = {}
  ): PetRuntime | null {
    const template = this.petTemplateTable.get(templateId);
    if (!template) return null;
    return this.generatePetFromTemplate(template, options);
  }

  /**
   * 从模板对象直接生成一只宠物实例（不依赖模板表）
   */
  generatePetFromTemplate(
    template: PetTemplate,
    options: GeneratePetOptions = {}
  ): PetRuntime {
    const {
      initialStatPoints = 0,
      name,
      baseAttrs: overrideAttrs,
      initialSkills,
    } = options;

    const baseAttrs = { ...template.baseAttrs, ...overrideAttrs };
    const skills: PetSkillSlot[] =
      initialSkills ??
      (template.skillIds ?? []).map((id) => ({ templateId: id, level: 1 }));

    const runtime: PetRuntime = {
      id: nextPetId(),
      templateId: template.id,
      name: name ?? template.name,
      grade: template.grade,
      baseAttrs,
      remainingStatPoints: initialStatPoints,
      statAllocation: {},
      skills,
    };

    return runtime;
  }

  /**
   * 获取已注册的模板（只读）
   */
  getTemplate(templateId: string): PetTemplate | undefined {
    return this.petTemplateTable.get(templateId);
  }
}
