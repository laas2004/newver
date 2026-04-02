import { chatWithOllama } from "@/lib/ollama";
import { Domain } from "@/lib/types";

const DOMAIN_VALUES: Domain[] = ["citizen_law", "hr_law", "company_law"];
const DOMAIN_SET = new Set<Domain>(DOMAIN_VALUES);

function routeByKeywords(question: string): Domain | null {
  const q = question.toLowerCase();

  // HR LAW - Employment, workplace, employee benefits
  if (
    q.includes('probation') ||
    q.includes('probationary') ||
    q.includes('working hours') ||
    q.includes('work hours') ||
    q.includes('attendance') ||
    q.includes('leave') ||
    q.includes('leave travel allowance') ||
    q.includes('lta') ||
    q.includes('education allowance') ||
    q.includes('educational allowance') ||
    q.includes('allowance') ||
    q.includes('employee') ||
    q.includes('employees') ||
    q.includes('employment') ||
    q.includes('salary') ||
    q.includes('wages') ||
    q.includes('payroll') ||
    q.includes('pf') ||
    q.includes('provident fund') ||
    q.includes('esi') ||
    q.includes('gratuity') ||
    q.includes('bonus') ||
    q.includes('recruitment') ||
    q.includes('termination') ||
    q.includes('resignation') ||
    q.includes('retirement') ||
    q.includes('misconduct') ||
    q.includes('disciplinary') ||
    q.includes('workplace') ||
    q.includes('hr') ||
    q.includes('human resource') ||
    q.includes('training') ||
    q.includes('appraisal') ||
    q.includes('performance') ||
    q.includes('contract') ||
    q.includes('notice') ||
    q.includes('dismissal') ||
    q.includes('leave') ||
    q.includes('holiday') ||
    q.includes('overtime') ||
    q.includes('shift') ||
    q.includes('attendance')
  ) {
    return "hr_law";
  }

  // COMPANY LAW - Corporate, companies act, business
  if (
    q.includes('company') ||
    q.includes('corporation') ||
    q.includes('corporate') ||
    q.includes('director') ||
    q.includes('board') ||
    q.includes('shareholder') ||
    q.includes('share capital') ||
    q.includes('paid up') ||
    q.includes('deposit') ||
    q.includes('debenture') ||
    q.includes('liquidator') ||
    q.includes('winding up') ||
    q.includes('insolvency') ||
    q.includes('sebi') ||
    q.includes('stock exchange') ||
    q.includes('ipo') ||
    q.includes('merger') ||
    q.includes('amalgamation') ||
    q.includes('prospectus') ||
    q.includes('securities') ||
    q.includes('shares') ||
    q.includes('dividend') ||
    q.includes('audit') ||
    q.includes('annual return') ||
    q.includes('memorandum') ||
    q.includes('articles')
  ) {
    return "company_law";
  }

  // CITIZEN LAW - Criminal, penal, IPC
  if (
    q.includes('crime') ||
    q.includes('criminal') ||
    q.includes('murder') ||
    q.includes('theft') ||
    q.includes('movable property') ||
    q.includes('property') ||
    q.includes('robbery') ||
    q.includes('assault') ||
    q.includes('rape') ||
    q.includes('counterfeit') ||
    q.includes('fraud') ||
    q.includes('forgery') ||
    q.includes('defamation') ||
    q.includes('bail') ||
    q.includes('arrest') ||
    q.includes('fir') ||
    q.includes('police') ||
    q.includes('court') ||
    q.includes('judge') ||
    q.includes('ipc') ||
    q.includes('bns') ||
    q.includes('bnss') ||
    q.includes('movable property') ||
    q.includes('property') ||
    q.includes('offence') ||
    q.includes('punishment') ||
    q.includes('evidence') ||
    q.includes('witness')
  ) {
    return "citizen_law";
  }

  return null;
}

export async function routeQuestionToDomain(question: string): Promise<Domain> {
  // First try keyword routing
  const keywordDomain = routeByKeywords(question);
  if (keywordDomain) {
    console.log(`Keyword routing: ${keywordDomain}`);
    return keywordDomain;
  }
  
  // Fallback to LLM routing
  const systemPrompt = [
    "Classify the user question into exactly one domain:",
    "- hr_law: employment, recruitment, probation, working hours, leave, allowances, salary, wages, misconduct, termination, workplace policies.",
    "- company_law: companies act, directors, board, shares, prospectus, securities, deposits, liquidation, winding up.",
    "- citizen_law: criminal law, IPC, BNS, property, movable property, theft, fraud, court, police, evidence.",
    'Respond with only: {"domain":"hr_law|company_law|citizen_law"}',
  ].join("\n");

  try {
    const raw = await chatWithOllama(systemPrompt, `Question: ${question}`);
    const match = raw.match(/"domain"\s*:\s*"([^"]+)"/);
    if (match && DOMAIN_SET.has(match[1] as Domain)) {
      return match[1] as Domain;
    }
  } catch (e) {
    console.error("LLM routing failed:", e);
  }
  
  return "citizen_law";
}