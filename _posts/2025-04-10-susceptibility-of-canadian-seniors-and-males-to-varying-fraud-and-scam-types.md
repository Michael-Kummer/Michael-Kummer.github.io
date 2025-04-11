---
layout: post
title: Susceptibility of Canadian Seniors and Males to Varying Fraud and Scam Types
date: 2025-04-10 20:36 -0600
categories: [research, fraud-prevention, seniors]
tags: [fraud, scam, seniors, canada, data-analysis]
math: True
---
Note: This is a nonfinal draft of a submission for a final paper for BUEC 420: Data Science Business Economics and a SOA Call for Essays.
## Abstract

Seniors within Canada are subject to a wide variety of scams and frauds.
Seniors are also more or less vulnerable to certain scams. In the face
of increasing automation, it is critical to explore current
vulnerabilities to prepare for changing levels of scams. Seniors tend to
lose more for most scams, especially scams done in person or using
methods with an individual visible on the other end. Romance scams and
investment scams will cause seniors to lose more. Females, especially
female seniors, are vulnerable to romance scams. At the same time, males
are more susceptible to investment scams, with similar scams following
similar gendered patterns. Guardrails should be put in place by
actuaries, financial planners, and general insurance staff.

## 1 Introduction

Demographic, methodological, and categorical factors are critical to
understanding scam rates within Canada, especially as the current scam
and fraud landscape continues to undergo massive change. Scammers
typically target specific demographics such as seniors as they are close
to retirement and either have their retirement money in a plan they can
withdraw out of or withdraw early from their pension plans. As machine
learning and large language models become more accessible, some scams
are at risk of increasing automation. Engaging with the current scam and
fraud landscape is critical to ensure that guardrails are pre-emptively
put into place.

As analyzing current trends can potentially help prevent future scams,
the Canadian "Anti-Fraud Centre Fraud Reporting System Dataset" will be
used to determine what exactly seniors within Canada are vulnerable to.
Based on the correlations between an individual's gender and senior
status, certain scams and methods targeting those demographics were
found. All significant scams and methods cause individuals to lose more
if the scams are more personable but vary in effect depending on gender
and senior status. The effect on each demographic varies, as some scams
will impact seniors drastically differently from non-seniors, and the
same applies to genders.

## 2 Background

Seniors within Canada have experienced a vast change before and after
COVID-19 as seniors have become more online and increasingly isolated.
Seniors have become more online at an increasing rate that spiked due to
COVID-19, with a 10% jump in internet usage between 2020 and 2022 for
those over 75.[^1] Post-COVID, many non-profits and volunteer-run
religious organizations have started to vanish at an alarming rate.[^2]
Local communities rely on volunteers, and without these organizations,
seniors who need help can no longer receive it, and those seniors who
wish to contribute have nowhere to help. This combination has led to an
unfortunate situation where seniors have less community support and are
more online.

Every scam can have varying impacts on the victim, and even though a
scam might have a significant blow on the individual's life, the scam
might not have led to any direct monetary loss. Certain scams must be
done in conjunction with other scams, as some require preceding
information to defraud a victim. Assigning dollars lost to scams can be
difficult as the exact dollar value of personal information is difficult
to quantify, and multiple scams can be related. For example, Canada's
"Anti-Fraud Centre Fraud Reporting System Dataset" contains information
on over 300,000 scams, whether successful or unsuccessful, within
Canada. Notably, the dataset has many reports of a dollar loss of $0 as
the losses that might be taken by another institution, such as a
workplace, or the crime might have been a predecessor to a different
crime.[^3]

## 3 Methodology

The analysis was done on panel data from Canada's Anti-Fraud Centre
Fraud Reporting System Dataset. As of March 2025, the dataset contains
observations from 2020 to 2024, totalling around 300k observations.
We're excluding the attempt data, data where information is anonymized
or N/A, and data where losses were 0. The rationale behind this is that
non-zero losses do not necessarily mean they are not zero and might be
extremely hard to quantify. For overly anonymized data, there are
inherent difficulties with analyzing NAs.

Analysis Data = Victim ∩ Non-Zero Loss ∩ Not NA

Small categories with few observations were combined or removed. There
were relatively few observations for 90+-year-olds, so this category was
combined into one for 164 observations. For the methodology used, mail,
television, video call, print, and radio were all combined as they
ranged from 80 to 3 observations in respective order. For scam
categories, those below 200 observations were combined as the number of
observations becomes a limitation to understanding if they might be
representative of the population or even important to look at.

![[ScamCategories.png]]({{'/assets/postImages/post2/ScamCategories.png' | relative_url}})
*Figure 1: Comparison between the Top 6 scams in frequency and their
respective dollar loss for seniors vs non-seniors.*

![[SolicitMethods.png]]({{'/assets/postImages/post2/SolicitMethods.png' | relative_url}})
*Figure 2: Comparison between the Top 5 methods in frequency and their
respective dollar loss for seniors vs non-seniors.*

### 3.1 Models

Category Interaction:

$$\ln\left( DollarLoss_{i} \right) = \beta_{0} + \sum_{j}^{}{\beta_{j}Category_{ij}} + \beta_{gender}Gender_{i} + \beta_{senior}Senior_{i} + \beta_{year}Year_{i} + \sum_{k}^{}{\beta_{k}SolicitMethod_{ik}} + \sum_{j}^{}{\beta_{j,s}\left( Category_{ij} \times Senior_{i} \right)} + \sum_{j}^{}{\beta_{j,g}\left( Category_{ij} \times Gender_{i} \right)} + \varepsilon_{i}$$

OLS will be used to determine the impact of each variable, and multiple
models will be used to ensure that solicitation methods used, gender,
location, and year would not influence the significance of the results.
My reference categories were female, non-senior, and 2020, as that is
the first year of observations. Non-seniors were a reference category
due to the abundance of observations, and non-seniors were more evenly
spread across the scams. Overall, the gender demographics were split
equally except for a few scams, meaning it does not have any
significance what gender the reference category is.

The reference categories and methods were chosen due to number and
comparability. The reference category chosen was Emergency Fraud, where
the scammer pretends to be someone the victim knows and demands money to
get out of jail, hospitals, or some other urgent reason to help.
Emergency fraud has varied solicitation methods and typically requires
some amount of information about the victim, but it doesn't require the
scammer to spend a long period of time with the victim. Direct
Call/Phone was chosen as the reference category for the solicitation
methods used due to a variety of scams being able to be done over the
phone. Alongside the observation counts, phone and direct call scams can
be either completely automated or done after already having a connection
with the victim.

Data description-wise, much of the data contained categories with an
even spread. Gender was quite evenly split between males and females.
There seemed to be near-normal distribution for the ages. Scams and
solicitation methods contained categories with many observations that
were then tapered off into less commonly used categories.

## 4 Data

| **Demographic & Covariant** | **Basic** | **Male/Senior interaction** | **Solicit interaction** | **Category Interaction** |
|---------------------------|--------------|------------------------|----------------------|------------------------|
| Intercept                 | 7.818^\*\*\*^ | 7.813^\*\*\*^          | 7.798^\*\*\*^        | 7.261^\*\*\*^          |
| Senior                    | 0.292^\*\*\*^ | 0.303^\*\*\*^          | 0.410^\*\*\*^        | 0.987^\*\*\*^          |
| Male                      | 0.092^\*\*\*^ | 0.099^\*\*\*^          | -0.058               | -0.026                 |
| Male X Senior             |              | -0.022                 |                      |                        |
| Year                      | 0.199^\*\*\*^ | 0.199^\*\*\*^          | 0.199^\*\*\*^        | 0.199^\*\*\*^          |
| Observations              | 39888         | 39888                  | 39888                | 39888                  |
| Adjusted R^2^             | 0.43          | 0.43                   | 0.431                | 0.438                  |
| Residual Std. Error       | 1.767 (df=39848) | 1.767 (df=39847)   | 1.766 (df=39836)     | 1.756 (df=39791)       |
| F Statistic               | 772.953^\*\*\*^ | 753.624^\*\*\*^     | 593.125^\*\*\*^      | 324.389^\*\*\*^        |

*Figure 4: Significance for demographics*

Note: \*p\<0.1; \*\*p\<0.05; \*\*\*p\<0.01

Note: The tables reference category is Emergency Fraud and the reference
solicit method is direct call.

| **Scam & Covariant** | **Basic** | **Male/Senior interaction** | **Solicit interaction** | **Category Interaction** |
|--------------------|--------------|------------------------|----------------------|------------------------|
| Recovery Pitch     | 0.717^\*\*\*^ | 0.720^\*\*\*^          | 0.749^\*\*\*^        | 0.977^\*\*\*^          |
| Recovery Pitch X Male |           |                        |                      | 0.214                  |
| Recovery Pitch X Senior |         |                        |                      | -0.363^\*^             |
| Romance           | 1.989^\*\*\*^ | 1.991^\*\*\*^          | 2.014^\*\*\*^        | 2.566^\*\*\*^          |
| Romance X Male    |              |                        |                      | -0.539^\*\*\*^         |
| Romance X Senior  |              |                        |                      | -0.315^\*\*^           |
| Investment        | 1.959^\*\*\*^ | 1.961^\*\*\*^          | 1.986^\*\*\*^        | 2.354^\*\*\*^          |
| Investment X Male |              |                        |                      | 0.231^\*\*^            |
| Investment X Senior |            |                        |                      | -0.718^\*\*\*^         |
| Job Scam          | 0.751^\*\*\*^ | 0.754^\*\*\*^          | 0.767^\*\*\*^        | 1.081^\*\*\*^          |
| Job Scam X Male   |              |                        |                      | 0.383^\*\*\*^          |
| Job Scam X Senior |              |                        |                      | -0.546^\*\*\*^         |

*Figure 5: Senior Scam Vulnerability Profile*

Note: \*p\<0.1; \*\*p\<0.05; \*\*\*p\<0.01

Note: The tables reference category is Emergency Fraud and the reference
solicit method is direct call.

For romance scams, females will lose more than males, especially females
who are non-seniors. Previous research aligns with this, but specific
research has shown that educated women who score high in risk-taking are
the target scam demographic for losses.[^4] Not only were females
scammed for more money, but they were also scammed more times. For
investment scams, males lost substantially more than females, and as
previously, the trend continues for senior males.

| **Variable** | **Basic** | **Male/Senior interaction** | **Solicit interaction** | **Category Interaction** |
|------------|--------------|------------------------|----------------------|------------------------|
| In Person  | 0.308^\*\*\*^ | 0.308^\*\*\*^          | 0.154                | 0.440^\*\*\*^          |
| In Person X Male |        |                        | 0.284^\*\*^          |                        |
| In Person X Senior |      |                        | 0.108                |                        |
| Email      | -0.683^\*\*\*^ | -0.683^\*\*\*^       | -0.811^\*\*\*^       | -0.589^\*\*\*^         |
| Email X Male |            |                        | 0.489^\*\*\*^        |                        |
| Email X Senior |          |                        | -0.222^\*\*\*^       |                        |
| Internet   | -0.635^\*\*\*^ | -0.634^\*\*\*^       | -0.655^\*\*\*^       | -0.542^\*\*\*^         |
| Internet X Male |         |                        | 0.201^\*\*\*^        |                        |
| Internet X Senior |       |                        | -0.157^\*\*\*^       |                        |
| Social Media | -0.788^\*\*\*^ | -0.788^\*\*\*^     | -0.773^\*\*\*^       | -0.672^\*\*\*^         |
| Social Media X Male |     |                        | 0.117^\*\*^          |                        |
| Social Media X Senior |   |                        | -0.129^\*\*^         |                        |
| Text Message | -0.368^\*\*\*^ | -0.368^\*\*\*^     | -0.257^\*\*\*^       | -0.268^\*\*\*^         |
| Text Message X Male |     |                        | 0.011                |                        |
| Text Message X Senior |   |                        | -0.312^\*\*\*^       |                        |

*Figure 6: Senior Method Vulnerability Profile*

Note: \*p\<0.1; \*\*p\<0.05; \*\*\*p\<0.01

Note: The table's reference category is Emergency Fraud, and the
reference solicitation method is direct call. Other was significant, but
Other X Male and Other X Senior were not.

**Redo with Histogram**

Methodology-wise, those methods where an individual can be potentially
visible or acknowledge there is a person on the other end cause the
victim to lose more. Some methods also seem to be gendered, as males who
meet someone in person will lose more money than potentially a female
over social media. This suggests that these individuals are more
susceptible to scams over these mediums or that they are more accessible
over those mediums.

## 5 Empirical analysis and explanation

Scams being gendered in their impacts means that the types of language
used within the scams should be investigated. Seeing what exactly is
enticing for each gender or senior category can potentially allow us to
mitigate the largest contributing factors to being scammed. Since
solicitation methods that are more personable seem to be more effective
than those where the person on the other end is unknown, the risk from
automated scams seems to be relatively low. Methods that are done online
or that can be automated seem to be less effective than those that
cannot. This can be potentially due to spam filters or individuals being
wary of any potential bot activity, but it is only a matter of time
before scammers use machine learning to augment the personable scams.

The correlations between dollar loss and gendered scams or scams that
focus on seniors seems to vary. Some scams seem to be quite successful
with certain demographics leading to the belief that there's something
intrinsic about these scams and these demographics. Certain methods,
such as text message scams that are most likely blind to the victim,
seem indiscriminate in who they target. For those we did not see a
significant difference between men and women, which most likely
indicates that seniors will be more likely to respond to them.
Alternatively, the explanation could be that seniors are more likely to
have their numbers already out there in these spam text lists.

A major limitation is that we are unable to see any further detail about
each occurrence. A substantial number of observations were removed after
the cleaning process. Since so many attempts exist, follow-up research
should be conducted on attempts and observations with a dollar loss of
$0. What exactly scammers are taking in a $0 scenario would be
extremely helpful, but as the best data we have is demographics, it
would be useful to investigate who is having information stolen from
them.

## 6 Conclusion and Recommendations

The landscape for scams is always changing, and scammers will improve in
both their skills and techniques over time. It seems that scams where
the human on the other end is more difficult to see scam individuals for
less money. The dangers of automated scams will most likely have to be
met with more automation. Those scams that require coordinated teams
cannot be fully automated, meaning the tactics used cannot be met with
more automation and will most likely have to be met with creative
measures and partial automation.

More research must be conducted on what exactly makes some scams
gendered and more damaging to seniors. The study on romance scams shows
that risk-taking behaviour is inherently intertwined with scam
susceptibility. However, more research will be required on unsuccessful
attempts, as some individuals might be targeted by more scams than
others, causing the likelihood of success to be greater.
Operationalizable definitions that are surveyable might allow for a
wider net to see what subsection of the population needs extra
attention.

## References

Canadian Securities Administrators. "Common Frauds and Scams."
Canadian Securities Administrators (website). Accessed April 4, 2025.
<https://www.securities-administrators.ca/investor-tools/avoiding-fraud/common-frauds-and-scams/>.

McRae, Don. "Volunteer-Supporting Charities Are Closing at Alarming
Rates." PANL Perspectives, Carleton University, August 22, 2023.
<https://carleton.ca/panl/2023/volunteer-charities-close-at-alarming-rates/>.

Royal Canadian Mounted Police, Canadian Anti-Fraud Centre. "Canadian
Anti-Fraud Centre Fraud Reporting System Dataset." Open Government,
Government of Canada. Published July 10, 2023, modified April 1, 2025.
<https://open.canada.ca/data/en/dataset/6a09c998-cddb-4a22-beff-4dca67ab892f>.

Statistics Canada. "Canadian seniors more connected than ever."
StatsCAN Plus. August 14, 2023.
<https://www.statcan.gc.ca/en/sc-plus/articles/2023-08-14-canadian-seniors-more-connected-than-ever>.
Accessed April 10, 2025.

Whitty, Monica T. "Do You Love Me? Psychological Characteristics of
Romance Scam Victims." *Cyberpsychology, Behavior and Social
Networking* 21, no. 2 (February 1, 2018): 105-109.
<https://doi.org/10.1089/cyber.2016.0729>.

## Appendix:

**All Models:**

Model 1: Base Vulnerability Model:

$$\ln\left( DollarLoss_{i} \right) = \beta_{0} + \sum_{j}^{}{\beta_{j}Category_{ij}} + \beta_{gender}Gender_{Male} + \beta_{senior}Senior_{i} + \sum_{k}^{}{\beta_{k}SolicitMethod_{ik}} + \beta_{year}Year_{i} + \varepsilon_{i}$$

Model 2: Male-Senior Interaction:

$$\ln\left( DollarLoss_{i} \right) = \beta_{0} + \sum_{j}^{}{\beta_{j}Category_{ij}} + \beta_{gender}Gender_{i} + \beta_{senior}Senior_{i} + \beta_{g \times s}\left( Gender_{i} \times Senior_{i} \right) + \sum_{k}^{}{\beta_{k}SolicitMethod_{ik}} + \beta_{year}Year_{i} + \varepsilon_{i}$$

Model 3: Solicitation Interaction:

$$\ln\left( DollarLoss_{i} \right) = \beta_{0} + \sum_{j}^{}{\beta_{j}Category_{ij}} + \beta_{gender}Gender_{i} + \beta_{senior}Senior_{i} + \beta_{year}Year_{i} + \sum_{k}^{}{\beta_{k}SolicitMethod_{ik}} + \sum_{k}^{}{\beta_{k,s}\left( SolicitMethod_{ik} \times Senior_{i} \right)} + \sum_{k}^{}{\beta_{k,g}\left( SolicitMethod_{ik} \times Gender_{i} \right)} + \varepsilon_{i}$$

Note: Model 4 is our main model and is represented in 3.1 Models

Analysis Data Description:

| **Solicitation Method** | **count** | | **Category** | **count** |
|------------------------|-----------|--|-------------|-----------|
| **Social Media**       | 14792     | | **Investments** | 8896 |
| **Internet**           | 12529     | | **Merchandise** | 7488 |
| **Direct call**        | 6642      | | **Service** | 4214 |
| **Email**              | 3076      | | **Vendor Fraud** | 3299 |
| **Text message**       | 2023      | | **Job** | 2874 |
| **Door to door/in person** | 699   | | **Romance** | 2528 |
| **Other**              | 150       | | **Bank Investigator** | 1957 |
|                        |           | | **Counterfeit Merchandise** | 1823 |
| **Age Group**          | **count** | | **Extortion** | 1582 |
| **1 - 20**             | 1360      | | **Emergency** | 1562 |
| **20 - 29**            | 7430      | | **Other** | 803 |
| **30 - 39**            | 7042      | | **Spear Phishing** | 784 |
| **40 - 49**            | 6357      | | **Loan** | 677 |
| **50 - 59**            | 5945      | | **Prize** | 621 |
| **60 - 69**            | 6318      | | **Recovery Pitch** | 448 |
| **70 - 79**            | 4045      | | **Grant** | 355 |
| **80 - 89**            | 1250      | |  |  |
| **90+**                | 164       | |  |  |

*Figure A.5: Senior Method Vulnerability Profile*

| **Variable** | **Basic** | **Male/Senior interaction** | **Solicit interaction** | **Category Interaction** |
|------------|--------------|------------------------|----------------------|------------------------|
| In Person  | 0.308^\*\*\*^ | 0.308^\*\*\*^          | 0.154                | 0.440^\*\*\*^          |
|            | -0.074        | -0.074                 | -0.125               | -0.074                 |
| In Person X Male |        |                        | 0.284^\*\*^          |                        |
|            |               |                        | -0.144               |                        |
| In Person X Senior |      |                        | 0.108                |                        |
|            |               |                        | -0.154               |                        |
| Email      | -0.683^\*\*\*^ | -0.683^\*\*\*^       | -0.811^\*\*\*^       | -0.589^\*\*\*^         |
|            | -0.046        | -0.046                 | -0.068               | -0.046                 |
| Email X Male |            |                        | 0.489^\*\*\*^        |                        |
|            |               |                        | -0.078               |                        |
| Email X Senior |          |                        | -0.222^\*\*\*^       |                        |
|            |               |                        | -0.084               |                        |
| Internet   | -0.635^\*\*\*^ | -0.634^\*\*\*^       | -0.655^\*\*\*^       | -0.542^\*\*\*^         |
|            | -0.035        | -0.035                 | -0.052               | -0.035                 |
| Internet X Male |         |                        | 0.201^\*\*\*^        |                        |
|            |               |                        | -0.055               |                        |
| Internet X Senior |       |                        | -0.157^\*\*\*^       |                        |
|            |               |                        | -0.058               |                        |
| Other      | -0.744^\*\*\*^ | -0.744^\*\*\*^       | -0.844^\*\*\*^       | -0.627^\*\*\*^         |
|            | -0.148        | -0.148                 | -0.251               | -0.148                 |
| Other X Male |            |                        | 0.082                |                        |
|            |               |                        | -0.294               |                        |
| Other X Senior |          |                        | 0.188                |                        |
|            |               |                        | -0.296               |                        |
| Social Media | -0.788^\*\*\*^ | -0.788^\*\*\*^     | -0.773^\*\*\*^       | -0.672^\*\*\*^         |
|            | -0.035        | -0.035                 | -0.051               | -0.036                 |
| Social Media X Male |     |                        | 0.117^\*\*^          |                        |
|            |               |                        | -0.053               |                        |
| Social Media X Senior |   |                        | -0.129^\*\*^         |                        |
|            |               |                        | -0.06                |                        |
| Text Message | -0.368^\*\*\*^ | -0.368^\*\*\*^     | -0.257^\*\*\*^       | -0.268^\*\*\*^         |
|            | -0.05         | -0.05                  | -0.078               | -0.051                 |
| Text Message X Male |     |                        | 0.011                |                        |
|            |               |                        | -0.091               |                        |
| Text Message X Senior |   |                        | -0.312^\*\*\*^       |                        |

[^1]: Statistics Canada, "Canadian seniors more connected than ever,"
    StatsCAN Plus, August 14, 2023, accessed April 10, 2025,
    <https://www.statcan.gc.ca/en/sc-plus/articles/2023-08-14-canadian-seniors-more-connected-than-ever>.

[^2]: Don McRae, "Volunteer-Supporting Charities Are Closing at
    Alarming Rates," PANL Perspectives, Carleton University, August 22,
    2023,
    <https://carleton.ca/panl/2023/volunteer-charities-close-at-alarming-rates/>.

[^3]: Royal Canadian Mounted Police, "Description and Associated
    Definitions of Canadian Anti-Fraud Centre (CAFC) Statistics"
    (Ottawa: Royal Canadian Mounted Police, n.d.), 4.

[^4]: Monica T. Whitty, "Do You Love Me? Psychological Characteristics
    of Romance Scam Victims," *Cyberpsychology, Behavior and Social
    Networking* 21, no. 2 (February 1, 2018): 105-109,
    <https://doi.org/10.1089/cyber.2016.0729>.
