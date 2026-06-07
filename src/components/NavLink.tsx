import React, { forwardRef } from "react";
import { NavLinkProps, NavLink as RouterNavLink } from "react-router-dom";
import "../styles/components/_NavLink.css";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={className}
        activeClassName={activeClassName}
        {...props}
      ></RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
export type { NavLinkCompatProps };
