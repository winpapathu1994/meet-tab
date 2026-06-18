declare module "swagger-ui-react" {
  import type { FC } from "react";

  interface SwaggerUIProps {
    url?: string;
    spec?: object | string;
    onComplete?: (system: unknown) => void;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    deepLinking?: boolean;
    filter?: boolean | string;
    layout?: string;
    requestSnippetsEnabled?: boolean;
    tryItOutEnabled?: boolean;
    withCredentials?: boolean;
  }

  const SwaggerUI: FC<SwaggerUIProps>;
  export default SwaggerUI;
}
