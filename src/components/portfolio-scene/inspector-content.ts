import type { PortfolioData } from "@/types/portfolio";
import type {
  InspectorContent,
  InspectorSection,
} from "@/types/inspector";
import type { FloorUserData } from "@/utils/building-model";

type ProjectItem = PortfolioData["projects"]["categories"][number]["items"][number];
type InspectorCopy = PortfolioData["ui"]["inspector"];

export function buildIdleInspectorContent(copy: InspectorCopy): InspectorContent {
  return {
    key: "idle",
    variant: "idle",
    message: copy.idleMessage,
  };
}

function buildFloorJsonPayload(
  floor: FloorUserData,
  copy: InspectorCopy,
): string {
  const payload = {
    guid: floor.id,
    level: floor.level,
    elevation: floor.elevation,
    properties: {
      area_m2: floor.area,
      material: floor.material,
    },
    status: copy.statusValue,
    sync: copy.syncValue,
  };
  return JSON.stringify(payload, null, 2);
}

export function buildFloorInspectorContent(
  floor: FloorUserData,
  copy: InspectorCopy,
): InspectorContent {
  const sections: InspectorSection[] = [
    {
      id: "floor-json",
      label: copy.floor.nodeLabel,
      kind: "json",
      json: buildFloorJsonPayload(floor, copy),
    },
  ];

  return {
    key: `floor-${floor.id}`,
    variant: "sections",
    headline: floor.id,
    sections,
  };
}

export function buildProjectInspectorContent(
  project: ProjectItem,
  copy: InspectorCopy,
): InspectorContent {
  const labels = copy.projectSections;
  const sections: InspectorSection[] = [
    {
      id: "context",
      label: labels.contextLabel,
      kind: "text",
      text: project.context,
    },
    {
      id: "impact",
      label: labels.impactLabel,
      kind: "text",
      text: project.impact,
    },
    {
      id: "role",
      label: labels.roleLabel,
      kind: "text",
      text: project.role,
    },
    {
      id: "platform",
      label: labels.platformLabel,
      kind: "text",
      text: project.platform,
    },
    {
      id: "scope",
      label: labels.scopeLabel,
      kind: "text",
      text: project.scope,
    },
    {
      id: "stack",
      label: labels.stackLabel,
      kind: "chips",
      chips: [...project.stack],
    },
  ];

  return {
    key: `project-${project.id}`,
    variant: "sections",
    headline: project.name,
    sections,
  };
}
