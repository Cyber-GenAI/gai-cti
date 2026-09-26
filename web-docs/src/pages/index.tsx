import { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import config from '@generated/docusaurus.config';

export default function HomeRedirect() {
  const history = useHistory();

  useEffect(() => {
    history.replace(`${config.baseUrl}docs/`);
  }, [history]);

  return null;
}
