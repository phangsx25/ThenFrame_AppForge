import { useCallback, useEffect, useRef, useState } from "react";

export function useAuth(client) {
  const [state, setState] = useState({
    session: null,
    profile: null,
    loading: Boolean(client),
    error: "",
  });
  const generation = useRef(0);
  useEffect(() => {
    if (!client) return;
    let alive = true,
      eventSeen = false;
    const revisions = generation;
    async function resolve(session) {
      const version = ++generation.current;
      setState((previous) =>
        previous.session?.user.id === session?.user.id && previous.profile
          ? { ...previous, session, error: "" }
          : { session: null, profile: null, loading: true, error: "" },
      );
      try {
        let profile = null;
        if (session) {
          const result = await client
            .from("profiles")
            .select("id,display_name,role")
            .eq("id", session.user.id)
            .single();
          if (result.error) throw result.error;
          if (!["customer", "admin"].includes(result.data?.role))
            throw new Error(
              "Your profile role is not recognized. Contact the studio owner.",
            );
          profile = result.data;
        }
        if (alive && version === generation.current)
          setState({ session, profile, loading: false, error: "" });
      } catch (error) {
        if (alive && version === generation.current)
          setState({
            session,
            profile: null,
            loading: false,
            error: error.message,
          });
      }
    }
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      eventSeen = true;
      // Do not await Supabase queries inside the auth callback.
      setTimeout(() => {
        if (alive) void resolve(session);
      }, 0);
    });
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!alive || eventSeen) return;
        if (error)
          setState({
            session: null,
            profile: null,
            loading: false,
            error: error.message,
          });
        else void resolve(data.session);
      })
      .catch((error) => {
        if (alive && !eventSeen)
          setState({
            session: null,
            profile: null,
            loading: false,
            error: error.message,
          });
      });
    return () => {
      alive = false;
      revisions.current++;
      subscription.unsubscribe();
    };
  }, [client]);
  const logout = useCallback(
    async (scope = "global") => {
      const { error } = await client.auth.signOut({ scope });
      if (error) throw error;
      generation.current++;
      setState({ session: null, profile: null, loading: false, error: "" });
    },
    [client],
  );
  const updateUserDetails = useCallback((user) => {
    if (!user) return;
    setState((previous) =>
      previous.session?.user.id === user.id
        ? { ...previous, session: { ...previous.session, user } }
        : previous,
    );
  }, []);
  return {
    ...state,
    updateUserDetails,
    logout,
    isAdmin: state.profile?.role === "admin" && !state.loading,
  };
}
