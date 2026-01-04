import React, { ReactNode } from "react";

interface PageHeaderProps {
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  title: string;
}
export const PageHeader = ({
  title,
  headerLeft,
  headerRight,
}: PageHeaderProps) => {
  return (
    <header className="page-header">
      {headerLeft}
      <h1>{title}</h1>
      {headerRight}
    </header>
  );
};
