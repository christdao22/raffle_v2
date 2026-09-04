import type { Person } from "@raffle_v2/shared";
import { useEffect, useReducer, useRef, useState } from "react";
import { type DisplayType, useLiveEvents } from "./use-live";

type LiveState = {
  displayType: DisplayType;
  selectedPrizeId: string | null;
  selectedRegionIds: string[];
  persons: Person[];
  isWinnerModalOpen: boolean;
  isDrawing: boolean;
  count: number;
};

type LiveAction =
  | { type: "HYDRATE"; events: Record<string, { payload: unknown }> }
  | { type: "PRIZE_SELECTED"; prizeId: string }
  | { type: "REGIONS_SELECTED"; regionIds: string[] }
  | { type: "DISPLAY_SELECTION"; display: DisplayType }
  | { type: "COUNTDOWN_START" }
  | { type: "WINNERS"; persons: Person[] }
  | { type: "MODAL_CLOSED" }
  | { type: "WINNER_COUNT"; payload: { count: number } };

const initialState: LiveState = {
  displayType: "standby",
  selectedPrizeId: null,
  selectedRegionIds: [],
  persons: [],
  isWinnerModalOpen: false,
  isDrawing: false,
  count: 0,
};

function reducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "HYDRATE": {
      let next = state;

      const displaySelection = action.events.DISPLAY_SELECTION;
      if (displaySelection) {
        next = { ...next, displayType: displaySelection.payload as DisplayType };
      }

      const prizeSelected = action.events.PRIZE_SELECTED;
      if (prizeSelected) {
        const { prizeId } = prizeSelected.payload as { prizeId: string };
        next = { ...next, selectedPrizeId: prizeId };
      }

      const winnerCount = action.events.WINNER_COUNT;
      if (winnerCount) {
        const { count } = winnerCount.payload as { count: number };
        if (typeof count === "number") {
          next = { ...next, count };
        }
      }

      const regionsSelected = action.events.REGIONS_SELECTED;
      if (regionsSelected) {
        const regionIds = (regionsSelected.payload as string[]) ?? [];
        if (Array.isArray(regionIds)) {
          next = { ...next, selectedRegionIds: regionIds };
        }
      }

      return next;
    }
    case "PRIZE_SELECTED":
      return { ...state, selectedPrizeId: action.prizeId };
    case "REGIONS_SELECTED":
      return { ...state, selectedRegionIds: action.regionIds };
    case "WINNER_COUNT":
      return { ...state, count: action.payload.count };
    case "DISPLAY_SELECTION":
      return { ...state, displayType: action.display };
    case "COUNTDOWN_START":
      return {
        ...state,
        persons: [],
        isDrawing: true,
        isWinnerModalOpen: true,
      };
    case "WINNERS":
      return {
        ...state,
        persons: action.persons,
        isDrawing: false,
        isWinnerModalOpen: true,
      };
    case "MODAL_CLOSED":
      return {
        ...state,
        isWinnerModalOpen: false,
        isDrawing: false,
      };
    default:
      return state;
  }
}

export function useLiveSocket(
  apiHost: string,
  onPrizeSelected?: (prizeId: string) => void,
  onRegionsSelected?: (regionIds: string[]) => void,
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const { data: initialEvents } = useLiveEvents();

  const hydratedRef = useRef(false);

  // Hydrate once as soon as the initial query resolves
  useEffect(() => {
    if (initialEvents && !hydratedRef.current) {
      dispatch({ type: "HYDRATE", events: initialEvents });

      const modalClosed = Boolean(initialEvents.MODAL_CLOSED);
      const latestWinners = initialEvents.WINNERS?.payload as { persons?: Person[] } | undefined;
      if (!modalClosed && latestWinners?.persons?.length) {
        dispatch({ type: "WINNERS", persons: latestWinners.persons });
      }

      const latestCountdown = initialEvents.COUNTDOWN?.payload as
        | { duration?: number; startedAt?: number }
        | undefined;
      if (!modalClosed && !latestWinners?.persons?.length && latestCountdown) {
        const { duration, startedAt } = latestCountdown;
        if (typeof duration === "number" && typeof startedAt === "number") {
          dispatch({ type: "COUNTDOWN_START" });
        }
      }

      hydratedRef.current = true;
    }
  }, [initialEvents]);

  const lastWinnerKeyRef = useRef<string | null>(null);
  const lastCountdownKeyRef = useRef<string | null>(null);

  // Keep latest callbacks without re-triggering the socket connection effect
  const onPrizeSelectedRef = useRef(onPrizeSelected);
  onPrizeSelectedRef.current = onPrizeSelected;

  const onRegionsSelectedRef = useRef(onRegionsSelected);
  onRegionsSelectedRef.current = onRegionsSelected;

  useEffect(() => {
    const cleanHost = apiHost.replace(/^https?:\/\//, "");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let heartbeatTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const scheduleHeartbeatTimeout = () => {
      if (heartbeatTimer) clearTimeout(heartbeatTimer);
      heartbeatTimer = setTimeout(() => {
        setConnectionStatus("disconnected");
        socket?.close();
      }, 35_000);
    };

    let handleMessage: (event: MessageEvent) => void;

    const connect = () => {
      if (disposed) return;
      setConnectionStatus("connecting");
      socket = new WebSocket(`${protocol}//${cleanHost}/ws`);
      socket.onmessage = handleMessage;

      socket.onopen = () => {
        setConnectionStatus("connected");
        scheduleHeartbeatTimeout();
      };

      socket.onclose = () => {
        if (heartbeatTimer) clearTimeout(heartbeatTimer);
        setConnectionStatus("disconnected");
        if (!disposed) {
          reconnectTimer = setTimeout(connect, 2_000);
        }
      };
    };

    handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "HEARTBEAT") {
          setConnectionStatus("connected");
          scheduleHeartbeatTimeout();
          return;
        }

        switch (data.type) {
          case "PRIZE_SELECTED": {
            const prizeId = data.payload.prizeId;
            dispatch({ type: "PRIZE_SELECTED", prizeId });
            onPrizeSelectedRef.current?.(prizeId);
            break;
          }

          case "REGIONS_SELECTED": {
            const regionIds = (data.payload as string[]) ?? [];
            dispatch({ type: "REGIONS_SELECTED", regionIds });
            onRegionsSelectedRef.current?.(regionIds);
            break;
          }

          case "DISPLAY_SELECTION": {
            dispatch({ type: "DISPLAY_SELECTION", display: data.payload });
            break;
          }

          case "WINNER_COUNT": {
            dispatch({ type: "WINNER_COUNT", payload: { count: data.payload.count } });
            break;
          }

          case "COUNTDOWN": {
            const { duration, startedAt } = data.payload as {
              duration: number;
              startedAt: number;
            };

            const countdownKey = `${duration}-${startedAt}`;
            if (lastCountdownKeyRef.current === countdownKey) return;
            lastCountdownKeyRef.current = countdownKey;

            dispatch({ type: "COUNTDOWN_START" });
            break;
          }

          case "WINNERS": {
            const winnerPersons = data.payload.persons as Person[];
            if (!winnerPersons?.length) return;

            const winnerKey = winnerPersons.map((p) => p.id).join(",");
            if (lastWinnerKeyRef.current === winnerKey) return;
            lastWinnerKeyRef.current = winnerKey;

            dispatch({ type: "WINNERS", persons: winnerPersons });
            break;
          }

          case "MODAL_CLOSED": {
            lastWinnerKeyRef.current = null;
            lastCountdownKeyRef.current = null;
            dispatch({ type: "MODAL_CLOSED" });
            break;
          }
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (heartbeatTimer) clearTimeout(heartbeatTimer);
      if (socket && socket.readyState !== WebSocket.CLOSED) socket.close();
    };
  }, [apiHost]);

  const closeWinnerModal = () => {
    lastWinnerKeyRef.current = null;
    lastCountdownKeyRef.current = null;
    dispatch({ type: "MODAL_CLOSED" });
  };

  return { state, connectionStatus, closeWinnerModal };
}
