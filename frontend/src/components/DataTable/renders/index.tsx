import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiPopover,
} from "@elastic/eui";

import { formatDate, stringSeededRandomInRange } from "../../../utils";
import { renderDottedJson } from "../../../utils/renderFormater";
import { tableActions, tableColumnTypes } from "../../../types/table";
import { genericTableRow } from "../types";
import { badge_colors } from "../../../constants/colors";

export type ActionColor = "primary" | "accent" | "danger" | "success" | "warning";
export const renderAction = (
  action: tableActions,
  index: number,
  id: string,
  onClick?: (key: string, type?: string) => void
) => {
  if (!onClick) return null;

  const actionConfig: Record<string, { color: ActionColor; iconType: string }> =
  {
    edit: { color: "primary", iconType: "pencil" },
    "change password": {  color: "primary", iconType: "pencil" },
    delete: { color: "danger", iconType: "trash" },
    star: { color: "success", iconType: "starEmpty" },
    cancel: { color: "warning", iconType: "cross" },
    inject: { color: "primary", iconType: "importAction" },
    explain: { color: "success", iconType: "sparkles" },
    "re-inject": { color: "primary", iconType: "returnKey" },
    "manual-run": { color: "primary", iconType: "play" },
  };

  const actionDetails = actionConfig?.[action.toLowerCase()] ?? {color: "primary", iconType: "eye" };

  return (
    <EuiFlexItem className="!w-full" key={index}>
      <EuiButton
        aria-label={action}
        size="s"
        onClick={() => onClick(id, action)}
        color={actionDetails.color}
        iconType={actionDetails.iconType}
        className="!bg-transparent"
        iconSide="right"
      >
        <p className="w-full text-left">{action}</p>
      </EuiButton>
    </EuiFlexItem>
  );
};

export const renderCellType = (
  type: tableColumnTypes,
  value: genericTableRow<unknown>,
  id: string,
  selectedId: string,
  selectId: (id: string) => void,
  onClick?: (key: string, type?: string) => void
) => {
  const renderLabels = (labels: string[]) => (
    <EuiFlexGroup direction="row" gutterSize="s">
      {labels.map((label, index) => (
        <EuiFlexItem key={index}>
          <EuiBadge
            color={
              badge_colors[
              stringSeededRandomInRange(label, 0, badge_colors.length - 1)
              ]
            }
          >
            {label}
          </EuiBadge>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );

  const renderDate = (dateValue: unknown) => (
    <>{formatDate(String(dateValue))}</>
  );

  const renderScore = (scoreValue: unknown) => (
    <EuiFlexGroup
      className="relative"
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <div className="!w-full !h-full !bg-white !absolute !rounded" />
      <EuiBadge
        className="!z-10"
        color={`rgba(252, 191, 73, ${(parseInt(String(scoreValue)) / 100) * 1.15
          })`}
      >
        {String(scoreValue)}
      </EuiBadge>
    </EuiFlexGroup>
  );

  const renderBoolean = (boolValue: boolean) => (
    <EuiFlexGroup direction="row" justifyContent="center" alignItems="center">
      <EuiBadge color={boolValue ? "primary" : "default"}>
        {boolValue ? "Yes" : "No"}
      </EuiBadge>
    </EuiFlexGroup>
  );

  const renderActions = (
    actions: unknown[],
    onClick?: (key: string, type?: string) => void
  ) => {
    if (!onClick) return null;

    const handleOpenPopOver = (id: string) => {
      selectId(id);
    };
    const handleClosePopOver = () => {
      selectId("");
    };

    return (
      <EuiPopover
        button={
          <EuiButtonIcon
            disabled={!actions.length}
            onClick={() => handleOpenPopOver(id)}
            iconType="boxesVertical"
          />
        }
        isOpen={selectedId === id}
        closePopover={handleClosePopOver}
        anchorPosition="rightCenter"
        panelPaddingSize="s"
      >
        <EuiFlexGroup
          className="min-w-52"
          onClick={handleClosePopOver}
          gutterSize="s"
          direction="column"
          justifyContent="flexEnd"
          alignItems="flexEnd"
        >
          {actions.map((action, index) =>
            renderAction(action as tableActions, index, id, onClick)
          )}
        </EuiFlexGroup>
      </EuiPopover>
    );
  };

  const renderHealth = (health: unknown) => {
    const health_colors: Record<string, ActionColor> = {
      critical: "danger",
      high: "danger",
      medium: "warning",
      low: "success",
    };

    const color = health_colors[String(health)];

    return color ? (
      <EuiHealth color={color}>{String(health)}</EuiHealth>
    ) : (
      String(health)
    );
  };

  const renderLength = (length: number) => (
    <EuiFlexGroup direction="row" justifyContent="center" alignItems="center">
      <EuiBadge color="hollow">{String(length)}</EuiBadge>
    </EuiFlexGroup>
  );

  const renderJson = (value: object) => {
    return renderDottedJson(value).dottedJson
  } 

  switch (type) {
    case "labels":
      return Array.isArray(value) ? renderLabels(value) : value;
    case "date":
      return value ? renderDate(value) : "___";
    case "score":
      return value ? renderScore(value) : "___";
    case "bool":
      return renderBoolean(Boolean(value));
    case "action":
      return Array.isArray(value) ? renderActions(value, onClick) : null;
    case "health":
      return value ? renderHealth(value) : "___";
    case "length":
      return Array.isArray(value) ? renderLength(value.length) : "___";
    case "hidden":
      return null;
    case "text":
      return <>{String(value ?? "___")}</>;
    case "number":
      return typeof value === "number" ? renderLength(value) : "___";
    case "json":
      return typeof value === "object" && value !== null
        ? 
        <div className="line-clamp-3 overflow-hidden whitespace-break-spaces">
          {renderJson(value)}
        </div>
        : "___";
    default:
      return <>{value}</>;
  }
};

export const renderWidth = (type: tableColumnTypes, expanded = false): string => {
  const widthMap: Record<tableColumnTypes, string> = {
    labels: "250px",
    json: '50%',
    editable_text: '15%',
    editable_reliability: '15%',
    external_references: '25%',
    text: expanded ? "15%" : "10%",
    long_text: "30%",
    number: "8%",
    date: expanded ? "15%" : "10%",
    score: "52px",
    hidden: "0%",
    bool: "52px",
    length: "52px",
    health: "80px",
    warn_sign: "2%",
    action: "120px",
  };

  return widthMap[type] || widthMap.text;
};
