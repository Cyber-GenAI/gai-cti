import {
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiImage,
  EuiPageTemplate,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
} from "@elastic/eui";
import { Section } from "../../layout/component";
import { useCookies } from "react-cookie";
import { useSearchParams } from "react-router-dom";
import { useUtilities } from "../../context/utilities/utilities-context";
import { setAuthCookie, clearAuthCookie, loginRedirect } from "../../utils/auth";
import { Toastify } from "../../utils/toasts";

const AuthenticationComponent = () => {
  const [cookies] = useCookies(['auth']);
  const [searchParams] = useSearchParams();
  const { getESToken } = useUtilities();
  
  const initialCall = useRef(true);
  const [loading, setLoading] = useState(false);

  const redirectTo = decodeURIComponent(searchParams.get("redirectTo") ?? "/");

  useEffect(() => {
    if (!cookies.auth) return;

    const validate = async () => {
      setLoading(true);
      try {
        const token = await getESToken();
        if (token?.length) {
          loginRedirect(redirectTo);
        } else {
          clearAuthCookie();
        }
      } catch {
        clearAuthCookie();
          if (!initialCall.current) {
            Toastify({
              type: 'error',
              message: 'The username or password you entered is incorrect. Please try again.'
            })
          }
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [cookies.auth, getESToken, redirectTo]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const username = (e.currentTarget.username as HTMLInputElement).value.trim();
      const password = (e.currentTarget.password as HTMLInputElement).value;

      if (!username || !password) {
        setLoading(false);
        return;
      }

      const b64 = btoa(`${username}:${password}`);
      initialCall.current = false
      setAuthCookie(b64);
    },
    []
  );

  return (
    <EuiPageTemplate panelled grow>
      <Section centeredContent extendedBorder>
        <EuiPanel paddingSize="l">
          <EuiFlexGroup direction="column" alignItems="center" justifyContent="center" gutterSize="l">
            <EuiFlexItem grow={false}>
              <EuiPanel color="subdued" className="!rounded-full !w-fit p-2">
                <EuiImage
                  size={80}
                  alt="logo"
                  src="http://www.itrc.ac.ir/themes/irandrupalsignal/images/itrc-logo-footer.png"
                />
              </EuiPanel>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiTitle size="m"><h1>Welcome to GAI-CTI</h1></EuiTitle>
            </EuiFlexItem>

            <EuiFlexItem grow={false} className="!w-[300px]">
              <EuiPanel color="subdued" paddingSize="l">
                <EuiForm component="form" onSubmit={handleSubmit}>
                  <EuiFormRow label="Username" fullWidth>
                    <EuiFieldText name="username" placeholder="username" fullWidth disabled={loading} autoFocus />
                  </EuiFormRow>

                  <EuiFormRow label="Password" fullWidth>
                    <EuiFieldPassword name="password" placeholder="password" type="dual" fullWidth disabled={loading} />
                  </EuiFormRow>

                  <EuiSpacer size="m" />

                  <EuiButton type="submit" fill fullWidth isLoading={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                  </EuiButton>
                </EuiForm>
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </Section>
    </EuiPageTemplate>
  );
};

export const Authentication = memo(AuthenticationComponent);