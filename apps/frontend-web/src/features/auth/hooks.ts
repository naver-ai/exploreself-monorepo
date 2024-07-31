import { useCallback, useState } from 'react';
import { useSelector } from '../../redux/hooks';
import { Http } from '../../net/http';

export function useVerifyToken(): {
  verify: () => Promise<boolean>;
  isSignedIn: boolean | null;
} {
  const token = useSelector((state) => state.auth.token);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  const verify = useCallback(async () => {
    if (token != null) {
      try {
        const resp = await Http.axios.get('/auth/verify', {
          headers: Http.makeSignedInHeader(token),
        });
        if (resp.status === 200) {
          setIsSignedIn(true);
          return true;
        } else return false;
      } catch (ex) {
        console.log(ex);
        setIsSignedIn(false);
        return false;
      }
    } else {
      setIsSignedIn(false);
      return false;
    }
  }, [token]);

  return {
    verify,
    isSignedIn,
  };
}
