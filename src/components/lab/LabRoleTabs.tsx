import {
  Children,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

type RoleId = "admin" | "guest";

type RoleCardChildProps = {
  role: RoleId;
  title: string;
  children?: ReactNode;
};

type Props = {
  children: ReactNode;
  /** Aria-label del switch de roles. */
  ariaLabel?: string;
};

function isRoleCardElement(node: ReactNode): node is ReactElement<RoleCardChildProps> {
  if (!isValidElement(node)) return false;
  const props = node.props as Partial<RoleCardChildProps>;
  return props.role === "admin" || props.role === "guest";
}

/**
 * Une varios `<RoleCard>` en un switch (radio + CSS), sin frontera cliente:
 * así el MDX RSC puede leer `role`/`title` de los children.
 */
export function RoleTabs({ children, ariaLabel = "Roles" }: Props) {
  const uid = useId().replace(/:/g, "");
  const cards = Children.toArray(children).filter(isRoleCardElement);
  if (cards.length === 0) {
    return <div className="lab-role-tabs-fallback">{children}</div>;
  }

  const defaultRole =
    cards.find((card) => card.props.role === "guest")?.props.role ?? cards[0].props.role;
  const groupName = `lab-role-tabs-${uid}`;

  return (
    <div className="lab-role-tabs">
      {cards.map((card) => (
        <input
          key={`input-${card.props.role}`}
          type="radio"
          name={groupName}
          id={`${groupName}-${card.props.role}`}
          className={`lab-role-tabs__input lab-role-tabs__input--${card.props.role}`}
          value={card.props.role}
          defaultChecked={card.props.role === defaultRole}
        />
      ))}

      <div className="lab-role-tabs__switch" role="tablist" aria-label={ariaLabel}>
        {cards.map((card) => (
          <label
            key={`tab-${card.props.role}`}
            htmlFor={`${groupName}-${card.props.role}`}
            className={`lab-role-tabs__tab lab-role-tabs__tab--${card.props.role}`}
            role="tab"
          >
            {card.props.title}
          </label>
        ))}
      </div>

      {cards.map((card) => (
        <div
          key={`panel-${card.props.role}`}
          className={`lab-role-tabs__panel lab-role-tabs__panel--${card.props.role}`}
          role="tabpanel"
        >
          <div className="lab-role-tabs__body">{card.props.children}</div>
        </div>
      ))}
    </div>
  );
}
