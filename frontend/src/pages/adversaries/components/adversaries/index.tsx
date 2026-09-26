import { EuiCheckbox, EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle } from "@elastic/eui"
import { memo, useCallback, useMemo, useState } from "react"
import { LoadingPrompt } from "../../../../components";
import { adversary } from "../../../../types/adversaries";
import { SidebarItem } from "./component/sidebar-item";

interface IAdversariesProps {
  adversaries: adversary[];
  isLoading: boolean;
  selectedAdversary: string
  handleSelectApt: (apt: adversary) => void
}
const AdversariesComponent = ({
  isLoading,
  adversaries,
  selectedAdversary,
  handleSelectApt,
}: IAdversariesProps) => {
  const [filter, setFilter] = useState<string>('');
  const [showImportant, setShowImportant] = useState<boolean>(true);

  const handleToggleShowImportant = useCallback(() => {
    setShowImportant((prev) => !prev)
  }, [])

  const adversariesList = useMemo(() => {
    const query = filter.toLowerCase();

    return adversaries.filter((apt) => {
      const nameMatches = apt.name.toLowerCase().includes(query);
      return showImportant ? (apt.is_important && nameMatches) : nameMatches;
    });
  }, [adversaries, filter, showImportant]);

  return (
    <EuiPanel style={{ height: "100%" }}>
      <EuiFlexGroup className="!h-full !w-full" direction="column">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="s">
                <h2>APT list</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiCheckbox
                id="apt-list-important-only"
                onChange={handleToggleShowImportant}
                label="Show all"
                checked={!showImportant}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFieldSearch
            placeholder="Search APT"
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            isClearable
            aria-label="Search APT name."
          />
      </EuiFlexItem>

        <EuiFlexItem grow={1} className="eui-yScrollWithShadows">
          {isLoading ? (
            <LoadingPrompt size="s" rows={10} />
          ) : (
            <EuiFlexGroup direction="column" gutterSize="s">
              {adversariesList.map((apt) => (
                <SidebarItem
                  key={apt.id}
                  apt={apt}
                  isSelected={apt.id === selectedAdversary}
                  onSelectItem={handleSelectApt}
                />
              ))}
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  )
}

export const Adversaries = memo(AdversariesComponent)