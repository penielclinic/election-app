"use client";
import dynamic from "next/dynamic";

export default dynamic(() => import("./components/ApplyClient"), { ssr: false });
