// netlify/functions/getPowerBI.js
const soap = require("soap");

const ALLOWED_ORIGIN = "https://lucky-palmier-ad2422.netlify.app";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ ok: true })
    };
  }

  try {
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      body = {};
    }

    // Prefer server-side config for a single-dashboard setup.
    const workspaceId = process.env.PBI_WORKSPACE_ID || body.workspaceId;
    const reportId = process.env.PBI_REPORT_ID || body.reportId;

    if (!workspaceId || !reportId) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: JSON.stringify({
          error: "Faltan variables de entorno para Power BI",
          faltantes: [
            !workspaceId ? "PBI_WORKSPACE_ID" : null,
            !reportId ? "PBI_REPORT_ID" : null
          ].filter(Boolean)
        })
      };
    }

    const username = process.env.PBI_USER;
    const password = process.env.PBI_PASS;
    const WSDL = "https://bo-emea.opinat.com/index.php/ws/api-soap/ws?wsdl";

    const client = await soap.createClientAsync(WSDL);

    // EN TU BO (según screenshot) report_id ES EL GUID DEL REPORTE
    const [raw] = await client.apiGetPowerBiAccessAsync({
      username,
      password,
      workspace_id: workspaceId,
      report_id: reportId
    });

    const jsonString = raw?.return?.$value;

    if (!jsonString || jsonString.startsWith("KO")) {
      return {
        statusCode: 403,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: JSON.stringify({
          error: "Acceso denegado o reporte no permitido para este usuario",
          raw: jsonString
        })
      };
    }

    const data = JSON.parse(jsonString);

    const embedToken = data.embedToken?.token;
    const embedUrl = data.embedReports?.[0]?.embedUrl;
    const outReportId = data.embedReports?.[0]?.id;

    if (!embedToken || !embedUrl || !outReportId) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: JSON.stringify({
          error: "Respuesta SOAP incompleta",
          data
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({
        embedToken,
        embedUrl,
        reportId: outReportId
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ error: err.message })
    };
  }
};
