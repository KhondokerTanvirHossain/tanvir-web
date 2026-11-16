# Source facts for tanvir.eliooo.org and the résumé

Single source of truth. Every claim on the site and in the PDF traces back to a line here. Provided by Tanvir on 2026-09-12. Items marked INTERNAL do not appear on the public site.

## Identity

- Khondoker Tanvir Hossain ("Tanvir"). Dhaka, Bangladesh. Remote-ready, UTC+6.
- Email k.tanvir.hossain@gmail.com. GitHub github.com/KhondokerTanvirHossain. LinkedIn linkedin.com/in/k-tanvir-hossain/.
- Current title: Engineering Lead, Better Health, Celloscope Ltd, Oct 2025 to present (LinkedIn updated to match). At Celloscope since Sept 2021, first as Senior Software Engineer.
- Positioning: backend Java engineer who grew into owning delivery, platform and product for regulated systems (banking, government, healthcare).
- Side venture: elioo studio, eliooo.org.
- Education: BSc in Computer Science and Engineering, CUET, 2015 to 2019.
- Certifications: AWS (Intro, RDS, CloudFormation, EKS, Advanced Terraform), KodeKloud (Docker Swarm, Kubernetes, DevOps), Python.

## Timeline (dates to confirm)

| Period | Role | Where |
|---|---|---|
| Oct 2025 to present | Engineering Lead, product and platform, Better Health (current title; LinkedIn updated to match. Formerly listed as Senior Software Engineer, product and platform owner) | Celloscope |
| Jul 2024 to Sep 2025 (assumed) | Senior Software Engineer, engineering manager and architect (client title: Technical Product Manager), Primefocus Health | Celloscope |
| May 2023 to Jun 2024 (assumed) | Team Lead, MRA-IMS | Celloscope |
| Sep 2021 to Apr 2023 | Software Engineer, Internet Banking | Celloscope |
| 2020 to 2021 | Software Engineer, GRP government ERP, Accounts module | CoKreates |
| 2019 to 2020 | Development coordinator, CUET Computer Club | CUET |
| 2018 | Industrial attachment | SELISE |

## Case study 1: Internet Banking, Agrani Bank PLC

- Period Sep 2021 to Apr 2023. Team of 15. Started as backend Java developer.
- Product: Celloscope Internet Banking, mobile-first self-service banking (iOS, Android, web) for individuals, SMEs, corporates.
- Client: Agrani Bank PLC, state-owned. Public launch March 2022. Delivered in about one month. Temenos T24 core banking integration done in about one week via Celloscope's CBS middleware.
- Second deployment: Bangladesh Krishi Bank (Flora CBS), proving CBS-agnostic architecture.
- Scale, Mar 2022 to May 2026: 583K+ customers, BDT 212.5B+ (about USD 1.82B) processed, 23.2M logins in 2025, 20.9x transaction value growth launch year to 2025 peak, 120+ TPS (earlier profile said 150 TPS target; use 120+ as the published figure).
- Stack: Java, Spring Boot microservices, PostgreSQL, Redis, clean architecture. Angular frontend. Spring Security, OAuth2 PKCE, MFA, RBAC, mTLS, HashiCorp Vault, encryption at rest and in transit. GitLab CI/CD, Docker, feature flags, zero-downtime releases. Prometheus, Grafana, centralized logging. JUnit, Mockito. Jira Agile.
- Integrations: T24 core banking, BEFTN, NPSB/IBFT, QR transfers and cash withdrawal, MFS (bKash, Nagad, Upay), Bangla QR, ekpay, telco recharge, Election Commission eKYC (OCR, face match, liveness). Bill payments, fees, taxes, insurance. Self and assisted eKYC onboarding. Beneficiaries, multi-currency, EMI calculators, Bengali voice banking, FAQ chatbot.
- Tanvir's actual role: backend Java developer, then the engineer who faced the bank. Managed the bank's senior IT staff, gathered and translated requirements, directed the team to build them. Bank-hosted infrastructure meant he was physically at the bank for deployments and infra incidents until a separate DevOps team was formed. Owned test strategy. Ran Agile delivery in Jira.

## Case study 2: MRA-IMS, Microcredit Regulatory Authority

- Period after IB, ending around July 2024. Team Lead.
- Client: Microcredit Regulatory Authority, national regulator for all 731 MFIs in Bangladesh.
- Goal: one centrally managed multi-tenant platform digitizing loans, savings, accounting and field operations, with real-time regulator visibility. Fixed go-live timeline.
- Rollout: 2 MFIs as proof of concept with hands-on staff training, then expansion. Frequent field visits to Tangail to make paper-to-digital migration work in practice, accommodating records that were not kept by the book.
- Numbers: initial target 20 MFIs, 500 branches, 15,000 field officers, 600,000 borrowers, 1.2M accounts, scoped to scale to 731 MFIs. 600,000+ transactions per week at peak. 99.99% uptime.
- Architecture: configurable multi-tenant microfinance engine (product types, repayment schedules, interest calculation methods per tenant via configuration, not code). Reactive Java for throughput. Reactive batch and parallel processing for end-of-day and month-end. Load balancing, Redis, index tuning. MFA, OAuth2 PKCE, encryption, VPN, RBAC, full audit trails.
- Features: loan and savings lifecycle, accounting integration with automated vouchers, branch and field-officer management, real-time MIS and AIS reports for MFI management and regulator oversight.

## Case study 3: Remote Patient Monitoring, Primefocus Health

- Period from early 2024 engagement; Tanvir's role assumed Jul 2024 to Sep 2025. Role: engineering manager plus architect. Client-side title Technical Product Manager. Worked directly with the VP of Engineering as his right hand.
- Client: Primefocus Health, US healthcare startup, later acquired by LG NOVA. HIPAA-compliant RPM platform "Orion" for obesity care patients in a US health network. Celloscope was the full engineering partner; no in-house team at the client.
- Goal: investor-ready HIPAA-compliant MVP on a fixed date, low-maintenance after launch.
- Outcome: on time, on budget. HIPAA compliance scan 100% pass on all severities. Funding secured. Ongoing keep-the-lights-on partnership.
- Architecture: 8 to 10 Java Spring Boot microservices, patient app and provider portal, clean architecture. Single Flutter codebase for Android, iOS, web. AWS Cognito and Amplify auth with custom flows. Binah.ai rPPG SDK for camera-based heart rate and SpO2, selected after PoC against an alternative. Tenovi smart-scale integration with runtime strategy switch. Custom FF4j feature-flag service (role and environment based, A/B, dark launches, canary). ElastiCache Redis.
- Infra: multi-account, multi-stage AWS with dedicated VPCs and EKS clusters; RDS, ECR, Route53, CloudFront, WAF, Shield, KMS, Secrets Manager, HashiCorp Vault dynamic secrets, CloudTrail, Config, CloudWatch, Transfer Family SFTP, HA across AZs. Terraform and Terragrunt. GitLab CI/CD. Blue-green zero-downtime on Kubernetes. Prometheus, Grafana, Loki, Zipkin, PagerDuty and Slack alerts, 24/7 KTLO with P0/P1 playbooks. Appium mobile automation.
- Numbers: 8+ microservices, 2 portals, 3 environments, 99%+ uptime target.

## Case study 4: Better Health, Celloscope's own product

- Period Oct 2025 to present. Product lineage bdEMR to Niramoy to Better Health (rebrand July 2026). Positioning: a patient-first health platform for Bangladesh. It was designed for patients; built in order: e-prescriptions (eRx) for doctors, then telemedicine, now the patient's lifelong health record (LHR).
- Thesis: free voice-enabled prescription tool drives doctor adoption, creates patient accounts, then telemedicine and patient-owned EMR.
- Built as of Sep 2026: Prescription and Telemedicine modules, appointments, doctor dashboard, patient records.
- Prescription: schema-driven Rx engine with 18 dosage-form classes and Bangla dosing vocabulary; 27,000+ DGDA-verified medicines; 45,000+ chief-complaint terms with AI standardisation; lab panels with age and sex reference ranges; report OCR; two-column A4 print for pre-printed pads.
- Voice and AI: speech-to-text across seven prescription sections, Bangla, English and mixed. Gateway service owns AI I/O tracing, edit capture and PHI redaction. Accuracy pipeline measures WER and extraction precision, recall and F1 with a zero-tolerance gate for critical errors (wrong drug, dose, side, negation). In-house ~30M-parameter extraction model A/B tested against a hosted LLM. SNOMED CT (~150K codes), ICD-10, CPT loaded. No autonomous diagnosis, no dosing suggestions.
- Architecture: Keycloak OIDC; Java 21, Spring Boot 3 WebFlux, R2DBC, hexagonal, reactive-only; some .NET Core services; Python speech platform; Angular portals; five physically separate PostgreSQL clusters; Debezium CDC to Kafka (KRaft) to consolidated analytics PostgreSQL with PHI excluded at source; MinIO; Vault with Vault Secrets Operator. Idempotency framework, Redis invalidate-on-write caching, effectively-once Kafka consumers, publish-after-commit. Migrated Docker Swarm to K3s: Helm, Traefik, WAF, Cloudflare, GitLab CI/CD. Fluent Bit, Graylog, Elasticsearch, Prometheus, Grafana, Tempo, Zipkin, OTel, Locust.
- Delivery: five Jira Scrum boards (Prescription, Telemedicine, Platform Engineering, Prescription AI, consolidated product backlog), two-week sprints, 25 engineers across four streams. Definition of Done: a real doctor completes a prescription unassisted on production.
- Tanvir's contributions:
  - Product: prescription-first strategy and three-track build sequence; Doctor Portal PRD (~300 pages, 14 modules); Speech-to-Text PRD; Gherkin acceptance criteria; 60 epics and 215+ stories backlog consolidation; clinical dosing research schema; terminology standards selection; rebrand to Better Health.
  - Engineering: designed the Debezium to Kafka to analytics-Postgres CDC pipeline and fixed Kafka Connect OOM, TOAST/JSONB and SMT issues; built Angular plus Agora video consultation (auth guards, routing, tokens); designed the Bengali-first clinical encounter UI; operated Swarm and K3s, PostgreSQL, Vault, observability; security and compliance track (Bangladesh PDPO 2025, PHI handling, de-identification before LLM calls).
  - Delivery: PM and Scrum Master across four to five streams; Jira administration; sprint-close reports with DoD gap analysis; embedded QA; STT accuracy test plan; agentic PM layer with Claude agents per team, Jira as source of truth, propose-only writes.
  - Business: market sizing (national to Dhaka), pricing and cost models, revenue-stream register, investor and board reporting, doctor onboarding pilots, hospital go-live programme with a neurology hospital (~200 doctors, target Jan 2027).
- INTERNAL, keep off the site: team member names, competitor names and price points, TAM audit finding, OpEx percentage split, partner hospital procurement details, hiring plans.

## Earlier work

- CoKreates, 2020 to 2021: GRP government ERP, Accounts module. 13 Spring microservices, 119 controllers, Spring Cloud, Zuul, Eureka, Feign, OAuth2/JWT gateway.
- Skills and practices: Java 21, Spring Boot, Reactive Java, PostgreSQL, Elasticsearch, Kafka, Docker, Kubernetes, Terraform, Ansible, AWS, Angular. DDD, CQRS, event sourcing, clean and hexagonal architecture, TDD.
- Character notes from peers: pragmatic, ownership-first, takes responsibility for failures openly, fills gaps others leave, positive and energetic.
- Non-work: photography (former General Secretary, CUET Photography Society), Android apps, n8n and Telegram automations, a GameMaker fighting game.

## LinkedIn gap

Better Health is not on LinkedIn yet. Deliverable: a LinkedIn Experience entry (title, dates, description under 2,000 characters) drafted from case study 4.

## Products

All four designed, built and run by Tanvir alone, under the elioo studio (https://eliooo.org).

- Bolo, https://bolo.eliooo.org/, live: a voice-first speaking buddy for Bangla speakers who know English on paper but freeze when they speak.
- Medioo, https://medioo.eliooo.org/, live: keeps a family's medical papers and says what is written on them in plain Bangla; code decides urgency, numbers and medicines, the model only words what code has checked.
- Finioo, https://finioo.eliooo.org/, not live yet (link kept on purpose, status "Launching soon"): an AI co-pilot that builds and runs a founder's business model.
- IntelliDrugs, https://drugdb.eliooo.org/, live: Bangladesh's drug and interaction database with pharmacist review, honest about what it doesn't know.

## Availability

Open to remote roles with US and Canadian product teams. Keeps 8am to 12pm US Eastern open for overlap. Worked daily with a US client's leadership (Primefocus Health).

## Recommendations

Quoted verbatim from LinkedIn; an ellipsis marks a cut.

- Heronmoy Emon, Backend Software Engineer. Worked with Tanvir on the same team (teammate and mentee). April 29, 2025: "As a team lead, he demonstrates exceptional leadership - blending deep technical expertise with a collaborative and supportive approach that brings out the best in everyone on the team."
- Asiya Khatun Papiya, Human Resource Administrator (Technical Recruiter). Managed Tanvir directly. April 28, 2025: "He has master level grips over Spring Boot, System Architecture, Cloud Native. … He is a super genius in problem solving, team management, task management, hiring and mentoring."
