import { Data, Dimension } from 'hermes-parallel-coordinates';
import { useEffect, useRef } from 'react';

interface HermesProps {
  data: Data
  dimensions: Dimension[]
}

const HermesChart = ({
  data,
  dimensions
}: HermesProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const formattedDimensions: Dimension[] = dimensions.map((item) => ({
    ...item,
    dataOnEdge: false,
    disableDrag: false,
  }))

  useEffect(() => {
    const loadHermes = async () => {
      const Hermes = (await import('hermes-parallel-coordinates')).default;

      const options = {
        "style": {
          "axes": {
            "label": { "font": "bold 14px sans-serif" }
          },
          "data": {
            "series": [
              { "strokeStyle": "rgb(200, 0, 0)" },
              { "strokeStyle": "rgb(200, 150, 0)" },
              { "strokeStyle": "rgb(0, 200, 0)" },
              { "strokeStyle": "rgb(0, 100, 150)" },
              { "strokeStyle": "rgb(0, 0, 200)" }
            ]
          },
          "dimension": {
            "label": { "font": "bold 14px sans-serif" }
          }
        }
      }

      if (chartRef.current) {
        const hermes = new Hermes(chartRef.current, formattedDimensions, options, data);

        return () => {
          hermes.destroy();
        };
      }
    };

    loadHermes();
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default HermesChart;
