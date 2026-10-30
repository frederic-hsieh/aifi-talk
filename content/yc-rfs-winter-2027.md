# YC Winter 2027 RFS: From Easy to Hard for a Software Builder

[YC's Requests for Startups (RFS)](https://www.ycombinator.com/rfs) describes areas it wants founders to explore. This article covers all 11 requests in the Winter 2027 edition, as checked on October 30, 2026: the problem behind each request, what YC is looking for, and My idea.

I've arranged them by how difficult they might be for a typical software builder to get started. Assume an individual or small team that can code and use AI APIs; the progression considers the expertise, capital, and partnerships needed to obtain data, build a first version, and put it to work for a customer.

This is the article's reading order, not YC's ranking or a ranking of market size or likelihood of success. Some ideas are a first step toward the full solution.

## Contents

| # | RFS |
| --- | --- |
| 1 | The $15-an-Hour Expert |
| 2 | Own Your Intelligence |
| 3 | LLMs That Write Well |
| 4 | AI for City Hall |
| 5 | AI for the Air-Gapped Economy |
| 6 | Wall Street for the Physical Buildout |
| 7 | Plaid for Government Benefits |
| 8 | Data Center Supply Chain |
| 9 | Vertical Foundation Models |
| 10 | Robots Made in America |
| 11 | Startups in a World of Abundant Space Access |

## 1. The $15-an-Hour Expert

Tax work, insurance claims, and medical billing require specialist knowledge, so generalist workers usually need training before they can handle them. YC wants companies that use AI to support those workers so they can take on tasks that previously required specialists.

For document work, for example, AI could identify discrepancies and organize the evidence behind a decision. The worker could then complete an initial review and escalate questions beyond their expertise.

**My idea: An export-document and tax assistant.** Start with a defined set of products and trade routes. Help staff organize export documents and tax-related information, compare records, identify missing items, and list tax questions with supporting references for a customs or tax professional to review.

## 2. Own Your Intelligence

When a company depends entirely on an external model, its control over versions, deployment, and training is limited by the supplier's options. YC wants teams that help companies control specialized models: turn workflows into evals (tests of model performance), expertise into training data, and mistakes in production into improvements in the next version.

For customer-support classification, for example, a supervisor's corrections could help improve the model. A separate set of cases that was not used in training would then test whether those improvements carry over to unfamiliar situations.

**My idea: Help companies optimize their AI workflows through FDEs.** Train Forward Deployed Engineers to work directly with users inside companies, identify workflow bottlenecks, connect internal data and tools, and assess whether an existing model is enough or a company-specific model needs post-training.

Use real cases to build evals and track accuracy, processing time, and cost. Employee feedback should keep improving the system, while the ability to maintain and update it stays inside the company.

## 3. LLMs That Write Well

YC argues that training methods that make LLMs better at coding may also flatten their voice and style, while major AI labs may not prioritize writing quality. This RFS seeks model teams that make writing and conversation quality a central goal.

A rewrite can be fluent and still fail the writer if it loses their voice, important qualifications, or the order of their reasoning.

**My idea: A writing tool that learns from an author's edits.** Collect the author's drafts and finished versions to learn which revisions they accept. Establish a baseline with an existing model, then use post-training to develop a model with the author's style once enough data is available.

## 4. AI for City Hall

Building permits involve repeatedly checking plans, land-use rules, and requests for additional information. Waiting also adds to project costs. YC wants companies that help city governments handle this work with AI, starting with permits and expanding into licensing, inspections, and public records.

These tools need to show the basis for their findings, so applicants know what to supply and reviewers can trace the results.

**My idea: A pre-submission check for small renovations.** Start with one city and one application type. Identify missing items against published requirements and link back to the relevant rules, with the aim of reducing requests for additional information.

## 5. AI for the Air-Gapped Economy

Some data in defense, healthcare, and other settings cannot be sent to an external AI API. Even more capable AI may therefore remain unusable. YC wants companies that bring AI into these environments, including on-prem models (deployed inside the customer's infrastructure), deployment tools, security accreditation, and hardware.

Air-gapped means isolated from external networks. Data access, permissions, updates, and rollback to an earlier version all need to work offline.

**My idea: Deploy open-weight models for companies.** Help these companies choose models whose weights they can obtain and deploy themselves, along with suitable hardware. Deploy them internally and connect internal data and access controls, so employees can use AI without an external connection or sending company data out.

Include offline updates, performance tuning, and maintenance, allowing the company's own IT team to take over management.

## 6. Wall Street for the Physical Buildout

Robots, GPU clusters, and data centers require substantial spending upfront, but financing may not reflect how these assets operate. YC wants companies providing lending, leasing, securitization, and hedging services suited to the physical AI buildout.

When assessing a leased robot, for example, the equipment price is only part of the picture. The lender also needs to consider whether income will continue and how maintenance or downtime affects repayment.

**My idea: Operating data for robot leasing.** Organize equipment uptime, maintenance records, completed work, and customer concentration to help lessors assess risk.

## 7. Plaid for Government Benefits

People applying for different benefits often have to resubmit income, household, and residency information. Agencies repeatedly check the same kinds of documents. YC wants a shared data service, similar to Plaid, that obtains trusted records directly from their sources with the applicant's consent and makes them reusable across applications.

Alongside the applicant's permission, data providers and receiving agencies need to accept the same verification process.

**My idea: Time-limited proof of income.** With the applicant's authorization, provide proof with a traceable source, an expiration date, and a way to correct errors. Start with one data provider and one agency willing to accept it.

## 8. Data Center Supply Chain

Power and cooling equipment can hold up data center construction. Buying GPUs does not mean a facility is ready to operate. YC wants companies that solve supply bottlenecks, including transformers, switchgear, liquid cooling, and upstream materials.

Engineering specifications and delivery times need to be considered together, so an available replacement does not turn out to be incompatible at installation.

**My idea: An equipment-substitution comparison service.** When a specified component is delayed, help engineers find potentially suitable alternatives, organize specifications and differences, and submit them for qualified review.

## 9. Vertical Foundation Models

Specialized industry tasks do not always need a long text response. They need reliable, affordable predictions or decisions. YC wants specialized foundation models for fields such as manufacturing, energy, and biology that work with no additional examples or only a few, while using substantially less inference compute and matching or exceeding general-purpose model performance.

The point is to reuse capabilities when encountering a new customer or piece of equipment, without assembling an entirely new training dataset.

**My idea: A warehouse demand-forecasting model.** Use orders, inventory, shipping records, and camera data to forecast product demand and help companies identify what needs replenishing and what might pile up. Combine those forecasts with supplier lead times and current stock to plan replenishment. The aim is for one model to work across different companies' warehouses without training from scratch for each customer.

## 10. Robots Made in America

Even as robots become more capable, production can still be constrained by imported components and manufacturing capacity. YC wants teams building a robotics supply chain in the United States, from magnets, motors, and sensors to grippers and the equipment used to manufacture these parts.

A company can start with a single component, but it ultimately needs reliable manufacturing, servicing, and delivery to become part of a customer's supply chain.

**My idea: Easy-to-repair packaging grippers.** Design for a specific production line, make worn parts quick to replace, and demonstrate reliability through operating tests.

## 11. Startups in a World of Abundant Space Access

High launch costs make some space businesses uneconomic today. YC asks what business models could become viable if those costs fell to one hundredth of today's level or lower. It wants teams to start preparing now rather than wait for the cost reduction to happen.

**My idea: A space laboratory.** Build a space laboratory that research teams can rent, letting them send samples, operate equipment remotely, and receive experimental data without organizing a complete space mission for every project.

Start with one type of experiment, such as comparing materials in microgravity, then gradually add equipment and services.
