"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_CLE, SUPABASE_URL } from "./config";

export const supabaseNavigateur = () => createBrowserClient(SUPABASE_URL, SUPABASE_CLE);
