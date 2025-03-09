---
layout: post
title: Senior vs Non-Senior Volunteerism In Alberta
date: '2024-12-31 16:22:20 -0700'
math: True
---

## Executive Summary

This analysis, based on the Government of Alberta's 2023 Online survey, delves into age-based differences in volunteer engagement, motivations, and barriers between seniors and non-seniors. The findings were used to create strategies for nonprofit organizations to recruit and retain volunteers, with special attention to senior volunteers who contribute disproportionately to the volunteer workforce.

## Current Landscapes & Challenges

The nonprofit sector of Alberta is experiencing a shift post-COVID, making the role of volunteers increasingly essential. Currently, we are seeing declines in the number of Canadians making charitable donations; some Canadians are feeling more disconnected and not donating money or time, all while service usage is at a record high (Canada Helps Giving Survey, 2024). Given these new changes, there needs to be adaptation and new techniques nonprofits use to engage communities.

Previously, recruiting volunteers entailed a rough strategy consisting of cold recruitment, training and integration of volunteers; then, those volunteers would assist in recruitment through word-of-mouth. Currently, individuals are volunteering less post-COVID, meaning organizations are losing out on a crucial recruitment method (Giving Survey, 2024).

My experience coordinating volunteers has consistently shown that:
1. A minority of highly engaged volunteers typically perform a substantial amount of volunteer work, but as the Giving Survey warns, these volunteers can burn out.
2. Maintaining consistent community engagement is challenging for coordinators, leading to campaign-based rather than continuous recruitment efforts.
3. Targeted outreach to specific demographics yields better results than broad recruitment campaigns.
4. College-age individuals need little reason or request to begin or try to apply for volunteering.
5. Seniors require genuine outreach to start volunteering at your organization.

## Methods

Currently, we are working on outdated information based on the Statistics Canada Survey on Giving, Volunteering and Participating (SVGP), which is pre-COVID (2018). Our most recent raw data is based on the Government of Alberta's 2023 Online survey. This survey contains a lot of irrelevant questions, but contains sections on volunteerism, and we have around 600 responses for volunteer-related items, so it is currently our best source of raw data on Volunteerism in Alberta.

Data preparation involved:
- Removing unrelated questions and standardizing related questions.
- Ensuring all "Refused to Respond"'s were changed to NA.
- Python (Pandas and PlotNine) are used for analysis and visualization.

Our hypothesis for this analysis is whether there is a substantial difference between the challenges faced by senior and non-senior volunteers.

### Demographics of Survey Respondents

#### Age Distribution Table

| Age Range   | Count    | Percentage |
| ----------- | -------- | ---------- |
| 18 to 24    | 67       | 4.3%       |
| 25 to 34    | 336      | 21.5%      |
| 35 to 44    | 268      | 17.1%      |
| 45 to 54    | 247      | 15.8%      |
| 55 to 64    | 325      | 20.8%      |
| 65 or older | 321      | 20.5%      |
| **Total**   | **1564** | **100%**   |

*Note: The limited representation of 18-24-year-olds (4.3%) restricts our ability to draw strong conclusions about this demographic.*

#### Education Level Table

| Education Level         | Count | Percentage |
| ----------------------- | ----- | ---------- |
| University graduate     | 689   | 44.1%      |
| College/trades graduate | 367   | 23.5%      |
| Some college/trades     | 220   | 14.1%      |
| High school graduate    | 134   | 8.6%       |
| Some university         | 95    | 6.1%       |
| Less than high school   | 33    | 2.1%       |
| Not reported            | 26    | 1.7%       |

#### Employment Status Table

| Employment Status  | Count | Percentage |
| ------------------ | ----- | ---------- |
| Working full-time  | 750   | 48.0%      |
| Retired            | 333   | 21.3%      |
| Self-employed      | 159   | 10.2%      |
| Working part-time  | 135   | 8.6%       |
| Unemployed         | 88    | 5.6%       |
| Student            | 37    | 2.4%       |
| Other/Not reported | 62    | 4.0%       |

#### Limitations
- Given that we have the fewest responses from the 18—to 24-year-old group, we will have a strong sampling bias against all of their responses, so we will be unable to draw any conclusions.
	- This is solved by creating two bins: Seniors and Non-Seniors.
- We only have bins to work with here, so we cannot necessarily create a regression for all of the values. Our best case scenario would be if we had the exact ages and hours volunteered, then we could see precisely how each response affects the rate of volunteering.

## Key Findings

##### Figure 1: Who is Volunteering?
![[Hours Volunteered.png]]({{'/assets/postImages/post1/Hours-Volunteered.png' | relative_url}})
*Note: the 18-24 range cannot be used to predict or determine anything about their volunteering rates*
As expected, senior individuals volunteer the most hours per month. The older an individual becomes, the longer they will spend volunteering. Younger groups, such as 25 to 34-year-olds, volunteer the fewest hours per month, which is to be expected as individuals under 55 will have less time than those who are retired.

##### Figure 2: Do Potential Volunteers Value Skill Development?
![[skill_development_heatmap.png]]({{'/assets/postImages/post1/skill_development_heatmap.png' | relative_url}})
In the past, I have found younger individuals to want to volunteer at places they would eventually like to work. These younger individuals also want more opportunities to grow their respective skill sets. Individuals under 55 align with this experience, as most would see increased appeal through skill-focused volunteering. 

##### Figure 3: Volunteer Appreciation Appeal by Age Group (%)
![[recognition_heatmap 1.png]]({{'/assets/postImages/post1/recognition_heatmap 1.png' | relative_url}})
In terms of volunteer appreciation, increasing levels of appreciation might not have the impact most coordinators believe it will on a subsection of volunteers. Since the distribution seems relatively even across most of the responses, volunteer appreciation is still important, but it does not positively affect all volunteers, especially older individuals.

## Statistical Analysis: Seniors vs. Non-Seniors

Two groups were chosen from this survey: seniors and non-seniors. Since individuals typically retire partway through the 55 - 64 age group, it is beneficial to include that entire age group in the senior/retired persons category.
###### Tips:
- P-value: Describes the probability that we would see these results under the null hypothesis. So here, it describes whether we'd see the Senior vs. Non-Senior type of responses in the total group of volunteers.
- Chi-squared: Measures variation between two unrelated groups and the result. Here, we use it to determine whether there are large variations between the two groups. We do not have random sampling, so we shouldn't rely on it too much.
- Asterisk (\*): Shorthand for denoting levels of significance.
	- NS: $P \gt 0.05$ (Not Significant)
	- "\*": $P \le 0.05$
	- "\*\*": $P \le 0.01$
	- "\*\*\*" $P \le 0.001$ (Very Significant)

### Top Challenges by Age Group

| Challenge                           | Seniors (%) | Non-Seniors (%) | Difference | p-value |
| ----------------------------------- | ----------- | --------------- | ---------- | ------- |
| Lack of available time              | 19.5%       | 42.3%           | -22.8%     | <0.0001 |
| Concerns about Age                  | 16.1%       | 4.1%            | +12.0%     | <0.0001 |
| No one asked                        | 16.0%       | 28.4%           | -12.4%     | <0.0001 |
| Finding volunteer opportunities     | 14.1%       | 23.3%           | -9.2%      | <0.0001 |
| Lack of flexible scheduling         | 6.3%        | 14.3%           | -8.0%      | 0.0001  |
| Location of volunteering            | 9.4%        | 15.7%           | -6.3%      | 0.0011  |
| Required too much/little time       | 9.0%        | 15.6%           | -6.6%      | 0.0021  |
| Did not accommodate groups/families | 3.7%        | 8.2%            | -4.5%      | 0.0037  |

*Note: % relates to % of the age group that states that the challenge affects them. All of the results in the table are statistically significant. This significance relates to whether there is a difference between senior and non-senior answers to each challenge.*

In almost all categories, senior individuals have fewer challenges than non-seniors; age is the only one where this is flipped. Volunteer organizations only have control over some of these factors, such as how they advertise. However, others, such as lack of available time, might be impractical or impossible to assist with.

### What is Appealing to Volunteers

| Appeal Factor                                           | Seniors (%) | Non-Seniors (%) | Difference | Chi-Square | p-value | Significance |
| ------------------------------------------------------- | ----------- | --------------- | ---------- | ---------- | ------- | ------------ |
| Access to flexible scheduling opportunities             | 72.3%       | 84.9%           | -12.6%     | 24.86      | <0.001  | ***          |
| Access to skill-matching opportunities                  | 63.8%       | 79.2%           | -15.4%     | 30.21      | <0.001  | ***          |
| Organizations supporting different ways of volunteering | 69.4%       | 77.3%           | -7.9%      | 8.63       | 0.003   | **           |
| Organizations supporting group/family volunteering      | 59.7%       | 72.1%           | -12.4%     | 17.32      | <0.001  | ***          |
| Organizations that regularly recognize volunteers       | 68.7%       | 74.1%           | -5.4%      | 3.86       | 0.049   | *            |
| Organizations that are welcoming and inclusive          | 81.2%       | 83.6%           | -2.4%      | 1.05       | 0.306   | NS           |
| Organizations that understand community needs           | 79.4%       | 82.1%           | -2.7%      | 1.21       | 0.271   | NS           |
| Access to technology training opportunities             | 58.9%       | 65.7%           | -6.8%      | 5.13       | 0.024   | *            |

*Note: Significance relates to whether there is a difference between senior and non-senior answers to each challenge. Anything above neutral was combined, and anything below neutral was combined.*

The differences between the desire for skilled positions with flexible scheduling and the necessity for group or family-oriented volunteering are noteworthy. Non-senior volunteers tend to prefer group volunteering more than their senior counterparts. However, organizations should recognize that certain similarities across age groups are negligible, as volunteers universally value organizations that are welcoming and attuned to community needs, which are non-negotiables rather than age-specific considerations.

## Strategic Implications for Nonprofit Organizations

### For Senior Volunteer Recruitment
1. **Direct Outreach Strategies**
- 16% of seniors cited "no one asked" as a barrier to volunteering. It can be difficult to reach out to seniors directly, so it will be easier to target community relations with senior-specific community groups such as retired professional associations, and religious organizations. Recruitment can also be assisted by leveraging word-of-mouth through existing senior volunteers.
- Ex. To establish relations with a local senior community, do something specifically for them such as gifting a free event or assist at a one-off event for them. Also ensure you email current volunteers to let them know when you are recruiting.
2. **Be Approachable**
- Specifically mention that seniors are welcome to volunteer when advertising. Then, use that promotional material to advertise at venues that seniors attend in your local community by using a senior program directory as a contact list.
- Ex. Include imagery of senior volunteers volunteering in promotional material then place posters in an area such as a community centre that specifically has senior recreation programs and/or senior pricing rates.
3. **Refocused Recognition**
- Traditional volunteer appreciation may have less impact on senior volunteers, and that effort can be replaced by emphasizing the community impact and social connection aspects of volunteering. Creating meaningful recognition that aligns with your senior volunteers' motivations can be more important than a one-time thank you.
- Ex. If many senior volunteers are involved in a particular organization, doing something positive for that members of that organization may have a greater impact.

### For Non-Senior Volunteer Recruitment
1. **Skill Development Emphasis**
- Clearly articulate the professional skills that can be gained through volunteering at your nonprofit. Create structured volunteer paths that build marketable experiences, and you can offer low-cost certifications and job/academic references as rewards.
- Ex. Create a volunteer structure with positions for experienced individuals and upwards movability for current volunteers. The two entry routes for those positions will be either being highly qualified beforehand or by reaching enough volunteer hours. Publishing this on your website can help give a goal to current volunteers and assist with recruiting skilled volunteers.
2. **Flexible Scheduling**
- Implement variable commitment options that accommodate busy schedules or develop micro-volunteering one-time opportunities. Potentially utilize technology for remote or asynchronous volunteering options.
- Ex. Create small volunteering opportunities for individuals to do one-time volunteering, such as helping out with a specific event or potentially publicize a problem you have then offer rewards for solutions, akin to a call for essays.
3. **Group Volunteering Opportunities**
- Create family-friendly or team-based volunteer experiences for student groups. Partner with employers or student groups for group volunteering initiatives. An added benefit is that someone else will be responsible for that volunteer group.
- Ex. You can reach out to student groups and professional organizations that require volunteer hours and state that you have an event they can help with. Then, you can print out signs with their logo on it to say they helped with your event as a thank-you. As an added bonus they will most likely also repost promotional material on their social media if their logo is on it.

## Conclusion

The volunteer landscape in Alberta shows clear demographic patterns that are essential for volunteer coordinators to know. Senior volunteers contribute disproportionately to the volunteer workforce and face distinct challenges from non-seniors.

Post-pandemic, we can expect to see a decrease in volunteerism due to isolation and an increase in the intensity of volunteering due to the intentionality behind volunteering for the community, especially for 18- —to 24-year-olds. We will fully understand this effect once the most recent Giving, Volunteering, and Participating (GVP) survey based on 2024 data is released.

The key to effective volunteer engagement lies in understanding these demographic differences and designing volunteer programs that align with each age group's motivations, constraints, and preferences. As volunteer coordinators adapt to changing societal patterns, those who recognize and respond to these age-specific factors will be best positioned to build sustainable volunteer programs.

*Data source: [Government of Alberta's Open Data Portal](https://open.alberta.ca/publications/survey-of-albertans-online-report)*
