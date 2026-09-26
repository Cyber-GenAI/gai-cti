import { EuiBadge, EuiButtonIcon, EuiDescriptionList, EuiFlexGroup, EuiFlexItem, EuiHealth, EuiIcon, EuiLink, EuiMarkdownFormat, EuiPanel, EuiSpacer, EuiText, EuiTitle, EuiToolTip } from "@elastic/eui";
import { formatDate, stringSeededRandomInRange } from ".";
import { ActionColor } from "../components/DataTable/renders";
import { genericTable, PieChart, Table } from "../components";
import { flattenObject } from "../pages/logs/utils";
import dayjs from "dayjs";
import { BarChart } from "../components/Charts/BarChart";
import { tableColumnTypes } from "../types/table";
import { badge_colors } from "../constants/colors";
import { BarValue, HeatmapVisual, MapVisual, MetricVisual, NetworkVisual, ParallelCoordinatesVisual, PieVisual, StackedBarVisual, TreeMapVisual, VisualData, VisualType } from "../types/visuals";
import { AreaChart } from "../components/Charts/AreaChart";
import { Heatmap } from "../components/Charts/nivo/Heatmap";
import { StackedBarChart } from "../components/Charts/StackedBarChart";
import ServiceMap from "../components/Maps";
import { Network } from "../components/Charts/nivo/NetworkGraph";
import HermesChart from "../components/Charts/nivo/ParallelCoordinates";
import { TreeMapChart } from "../components/Charts/TreeMapChart";
import { ChordDiagram } from "../components/Charts/nivo/ChordDiagram";
import { chordDiagramData, chordDiagramKeys } from "../components/Charts/nivo/mock/chordDiagram";

export const renderCellType = (
  type: tableColumnTypes,
  value: unknown,
) => {
  const renderLabels = (labels: string[]) => (
    <EuiFlexGroup className="!w-full" wrap direction="row" gutterSize="s">
      {labels.map((label, index) => (
        <EuiFlexItem grow={false} key={index}>
          <EuiBadge
            className="!max-w-52 !whitespace-nowrap overflow-ellipsis"
            color={badge_colors[stringSeededRandomInRange(label, 0, badge_colors.length - 1)]}
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
      justifyContent="flexStart"
      alignItems="center"
    >
      <div className="!w-fit !h-full !bg-white !absolute !rounded" />
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
    <EuiFlexGroup direction="row" justifyContent="flexStart" alignItems="center">
      <EuiBadge color={boolValue ? "primary" : "default"}>
        {boolValue ? "Yes" : "No"}
      </EuiBadge>
    </EuiFlexGroup>
  );

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
    <EuiFlexGroup direction="row" justifyContent="flexStart" alignItems="center">
      <EuiBadge color="hollow">{String(length)}</EuiBadge>
    </EuiFlexGroup>
  );

  switch (type) {
    case "labels":
      return Array.isArray(value) ? renderLabels(value) : value;
    case "date":
      return value ? renderDate(value) : "___";
    case "score":
      return value ? renderScore(value) : "___";
    case "bool":
      return value ? renderBoolean(Boolean(value)) : "___";
    case "action":
      return null
    case "health":
      return value ? renderHealth(value) : "___";
    case "length":
      return Array.isArray(value) ? renderLength(value.length) : "___";
    case "hidden":
      return null;
    case "warn_sign":
      return !!value && <EuiIcon color="warning" type="warning" />
    case "text":
      return <>{String(value ?? "___")}</>;
    case "number":
      return typeof value === "number" ? renderLength(value) : "___";
    case "json":
      return typeof value === "object" && value !== null
        ? <EuiText size="s">
          <p
            className="overflow-hidden text-ellipsis"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              maxHeight: '5rem',
              whiteSpace: 'normal',
            }}
          >
            {JSON.stringify(value, null, 2)}
          </p>
        </EuiText>
        : "___";
    case "external_references": {
      try {
        const cleaned = String(value)?.replace(/'/g, '"');
        const links: { url: string; source_name: string }[] = JSON.parse(cleaned ?? "[]");

        return (
          <EuiDescriptionList
            type="row"
            align="left"
            columnGutterSize="s"
            rowGutterSize="s"
            listItems={links?.map((item) => ({
              title: <EuiText size="s">{item.source_name}:</EuiText>,
              description: (
                <EuiLink target="_blank" href={item.url}>
                  {item.url}
                </EuiLink>
              ),
            }))}
          />
        );
      } catch (err) {
        console.error("Invalid external_references format:", err, value);
        return <EuiText color="danger">Invalid external references format</EuiText>;
      }
    }
    default:
      return <>{value}</>;
  }
};

export const renderCardValue = (
  type: VisualType,
  value: VisualData["value"],
  title: string,
  description?: string,
  size?: number,
  headless?: boolean
) => {
  if (!value) return null;

  const Wrapper: React.FC<{ children: React.ReactNode, isMetric?: boolean, compressed?: boolean, headless?: boolean }> = ({ children, isMetric = false, compressed = false, headless = false }) => (
    <EuiPanel paddingSize={compressed ? 's' : 'm'} style={{ minHeight: isMetric ? '12.5rem' : headless ? '20rem' : '25rem' }} className="!h-full !w-full !relative" hasShadow={false}>
      <EuiFlexGroup justifyContent="spaceBetween">
        {!headless && (
          <>
            <EuiFlexItem grow>
              <EuiTitle size="xs">
                <h3 className="w-3/4 text-left !text-base">{title}</h3>
              </EuiTitle>
            </EuiFlexItem>
            {
              !!description?.length &&
              <EuiFlexItem grow={false}>
                <EuiToolTip content={
                  <EuiPanel hasShadow={false} className="!w-full !bg-transparent !max-h-96 eui-scrollBar">
                    <EuiMarkdownFormat className="!text-white">{description}</EuiMarkdownFormat>
                  </EuiPanel>
                }>
                  <EuiButtonIcon
                    iconType="iInCircle"
                    aria-label={"iInCircle"}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            }
          </>
        )}
      </EuiFlexGroup>
      {children}
      {!compressed && <EuiSpacer />}
    </EuiPanel>
  );

  switch (type) {
    case "MetricVisual":
      return (
        <Wrapper isMetric>
          <EuiFlexGroup className="!w-full !h-full" justifyContent="flexEnd" alignItems="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiTitle className="md:!text-6xl !text-2xl !absolute right-2 bottom-2" size="l">
                <h1>{(value as MetricVisual["value"]) ?? "no data"}</h1>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Wrapper>
      );

    case "BarVisual":
      return (
        <Wrapper headless={headless}>
          <BarChart data={value as BarValue} />
        </Wrapper>
      );

    case "PieVisual":
      return (
        <Wrapper headless={headless}>
          <PieChart size={size} data={value as PieVisual["value"]} />
        </Wrapper>
      );

    case "AreaVisual":
      return (
        <Wrapper headless={headless}>
          <AreaChart data={value as BarValue} />
        </Wrapper>
      );

    case "HeatmapVisual": {
      const heatmapValue = value as HeatmapVisual["value"];
      return (
        <Wrapper headless={headless}>
          <div className="w-full h-full">
            <Heatmap key={`heatmap-chart-${title}`} domain={heatmapValue.domain} data={heatmapValue.data} />
          </div>
        </Wrapper>
      );
    }

    case "StackedBarVisual":
      return (
        <Wrapper headless={headless}>
          <StackedBarChart title="" xTitle={""} yTitle="" key={`stacked-chart-${title}`} data={(value as StackedBarVisual["value"])} />
        </Wrapper>
      );

    case "NetworkVisual":
      return (
        <Wrapper compressed>
          <div className="w-full h-[35rem]">
            <Network key={`network-chart-${title}`} data={value as NetworkVisual["value"]} />
          </div>
        </Wrapper>
      )

    case "TreeMapVisual":
      return (
        <Wrapper headless={headless}>
          <TreeMapChart key={`treemap-chart-${title}`} data={value as TreeMapVisual["value"]} />
        </Wrapper>
      )

    case "ChordVisual":
      return (
        <Wrapper headless={headless}>
          <div className="w-full h-full">
            <ChordDiagram keys={chordDiagramKeys} data={chordDiagramData} />
          </div>
        </Wrapper>
      )

    case "ParallelCoordinatesVisual":
      return (
        <Wrapper headless={headless}>
          <HermesChart key={`parallel-chart-${title}`} data={(value as ParallelCoordinatesVisual["value"]).data} dimensions={(value as ParallelCoordinatesVisual["value"]).dimensions} />
        </Wrapper>
      )

    case "MapVisual": {
      const map = (value as MapVisual["value"]).map((item, index) => {
        return {
          id: String(index),
          description: item.description,
          lat: item.latitude,
          lng: item.longitude,
          name: item.label
        }
      })
      return (
        <Wrapper headless={headless}>
          <ServiceMap
            dotSize="s"
            serviceNodes={map}
          />
        </Wrapper>
      )
    }

    case "TableVisual":
      {
        const tableValue = value as genericTable<string[] | number>;
        return (
          <Wrapper headless={headless}>
            <Table
              rows={tableValue.rows}
              columns={tableValue.columns}
              total={tableValue.total}
              filterable={tableValue.filterable}
              isLoading={false}
              last_row_cursor={""}
            />
          </Wrapper>
        );
      }

    default:
      return null;
  }
};
export const renderDottedJson = (object: unknown) => {
  const flatData = flattenObject(object as Record<string, unknown>);

  const rawTimestamp = flatData['@timestamp'] || flatData.timestamp;
  const formattedTimestamp = rawTimestamp && typeof rawTimestamp === 'string'
    ? dayjs(rawTimestamp).isValid()
      ? formatDate(rawTimestamp)
      : 'Invalid date'
    : 'N/A';

  const sourceData = Object.entries(flatData).filter(
    ([key]) => key !== '@timestamp' && key !== 'timestamp'
  );

  return {
    timestamp: formattedTimestamp,
    dottedJson: sourceData.map(([key, value]) => (
      <span key={key} className="!mr-2">
        <strong>{key}:</strong> {String(value)}
      </span>
    ))
  }
}