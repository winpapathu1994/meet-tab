"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-dark.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="swagger-container">
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
