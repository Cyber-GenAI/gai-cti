import { FC, useCallback, useEffect, useMemo } from 'react';
import { EuiToolTip, EuiCard, EuiPopover, EuiFlexGroup, EuiFlexItem, EuiHealth } from '@elastic/eui';
import { TechniqueCardProps } from './types';
import { LoadingPrompt } from '../../../../../components';
import { useRules } from '../../../../../context/rules/rules-context';

export const TechniqueCard: FC<TechniqueCardProps> = ({
  technique,
  id,
  isTechniqueOpen,
  handleCloseTechnique,
  handleOpenTechnique,
  getTechniqueColor,
  getTechniqueDescription
}) => {
  const { technique_rules, getTechniqueRules } = useRules();

  const rules = useMemo(() => technique_rules?.data ? technique_rules?.data.data : [], [technique_rules?.data])
  const handleGetTechniqueRules = useCallback(() => {
    getTechniqueRules(id)
  }, [getTechniqueRules, id])

  useEffect(() => {
    if (isTechniqueOpen)
      handleGetTechniqueRules()
  }, [handleGetTechniqueRules, isTechniqueOpen])
  
  return (
    <EuiToolTip content={id}>
      <EuiPopover
        button={
          <EuiCard
            onClick={() => Number(getTechniqueDescription(id).split(" ")[0]) && handleOpenTechnique?.(id)}
            title={technique.name}
            description={getTechniqueDescription(id)}
            paddingSize="s"
            className={`relative h-full w-[200px] !border !border-solid !border-gray-300 transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
            style={getTechniqueColor(id)}
            titleSize="xs"
            textAlign="left"
            display="plain"
          />
        }
        isOpen={isTechniqueOpen}
        closePopover={() => handleCloseTechnique?.()}
      >
        <EuiFlexGroup
          onClick={handleCloseTechnique}
          gutterSize="s"
          direction="column"
          className='!max-h-72 eui-yScrollWithShadows'
        >
          {
            rules.length ?
              <>
                {rules.map((item) =>
                  <EuiFlexItem key={item.id as string}>
                    <EuiHealth color={item.enabled ? 'success' : 'warning'}>
                      <h4>
                        {item.name}
                      </h4>
                    </EuiHealth>
                  </EuiFlexItem>
                )}
              </> :
              <LoadingPrompt size='m'/>
          }
        </EuiFlexGroup>
      </EuiPopover>
    </EuiToolTip>
  )
};
