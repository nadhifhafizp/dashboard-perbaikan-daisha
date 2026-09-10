'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ServerInfoState {
  ip: string;
  port: number;
  url: string;
  formattedTitle: string;
}

let cachedInfo: ServerInfoState | null = null;

export function useServerInfo() {
  const [serverInfo, setServerInfo] = useState<ServerInfoState | null>(cachedInfo);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!cachedInfo);

  useEffect(() => {
    let isMounted = true;

    async function fetchInfo() {
      try {
        const res = await fetch('/api/server-info');
        if (res.ok) {
          const data: ServerInfoState = await res.json();
          cachedInfo = data;
          if (isMounted) {
            setServerInfo(data);
            if (data.formattedTitle && typeof document !== 'undefined') {
              document.title = data.formattedTitle;
            }
          }
        }
      } catch (err) {
        console.error('Failed to load server info:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  const copyUrl = useCallback(async () => {
    if (!serverInfo?.url) return false;
    try {
      await navigator.clipboard.writeText(serverInfo.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      return false;
    }
  }, [serverInfo?.url]);

  return {
    serverInfo,
    loading,
    copied,
    copyUrl,
  };
}
