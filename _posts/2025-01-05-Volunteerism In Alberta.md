---
layout: post
title: WIP Volunteerism In Alberta
date: '2024-12-31 16:22:20 -0700'
---



## Background
<p>The nonprofit sector of Alberta is experiencing new trends and, with older trends being exacerbated. Currently, we're seeing declines in the number of Canadians making charitable donations; some Canadians are feeling more disconnected and not giving money or time, and service usage is increasing (Giving survey, 2024). Given these new changes, there needs to be adaptation and new techniques nonprofits use to engage communities.</p>

Previously, recruiting volunteers entailed a rough strategy consisting of cold recruitment, training and integration of volunteers; then, those volunteers would assist in recruitment through word-of-mouth. Given that some reports say that individuals are volunteering less post-COVID, organizations are losing out on a crucial recruitment method.

From my own personal experience, I've found the following to be generally true:
- A majority of the volunteer work is done by a minority of volunteers who are highly engaged
- Consistent community engagement is extremely difficult for coordinators. I've noticed most organizations work in phases or campaigns instead of constantly maintaining pressure.
- Targeting specific populations is better than casting as wide a net as possible.
	- Ex. leadership groups or certain student groups

Currently, the nonprofit sector is facing a variety of changes that each organization can fit into:
1) They have been receiving decreased donations in past years
2) They are receiving the same or more in donations from a smaller group of individuals

College-age individuals need little reason or request to begin or try to apply for volunteering. Seniors need genuine outreach to volunteer. Individuals in between might not volunteer unless they have an explicit reason to, as in they truly want to volunteer there or they need professional hours.


## Discussion
From the Giving Report, we know that people volunteer when they feel connected and are able to see direct results—hence why environmental factors were focused upon, as the results are typically not immediate and potentially less tangible. For other organizations not in the environment, the decline in consecutiveness means more isolation for seniors. Since we cannot literally reach out to every senior in isolation, we must go through large community groups and have them distribute volunteering opportunities.

The pandemic has caused a lot of isolation and potentially even decline. If there's documented analysis, we can make the following two hypotheses where one is based on the recent term, and one is focused on long-term effects:
1) Post-pandemic, we can expect to see a decrease in volunteerism due to isolation and an increase in the intensity of volunteering due to the intentionality behind volunteering for the community.
To make 1) disprovable, we will try to look through the most recent data. However, we will fully understand this effect once the most recent Giving, Volunteering, and Participating (GVP) survey based on 2024 data is released. At best, we can predict the falsifiability of this statement until the survey is released.

1) Economically, we can potentially see a similar effect. Given that Alberta is a resource economy, it will experience large booms and large busts, which are pegged directly to the value of resources. Potentially, in these bust cycles, we can see the same effects.
For 2) to be disprovable, we can look at data on Alberta's economic dashboard for 2022/23. We do not necessarily have anything to compare our survey data to until GSV 2024 is released, but we might be able to see some broad trends.


## Methods
Currently, we're working on outdated information based on the Giving Survey, which is pre-COVID. The most recent raw data we have is based on the Government of Alberta's 2023 Online survey. This survey is extremely broad but contains sections on volunteerism, and we have around 600 responses for volunteer-related items, so it is currently the best we have.

In cleaning the data, I replaced the questions with the guidebook and simplified them. This was done using Pandas and PlotNine, though PlotNine can easily be substituted for Matplotlib or any other Python plotting program.

After importing the data, we can use the questions to create a dictionary and substitute our codes. We can also create simplified names for our questions.

```
rename_dict = dict(zip(
    onlineQuestions['Variable'],  # Original names
    onlineQuestions['Label'].str.split('--').str[1].str.strip()  # Clean labels
))

renamedOnline22 = onlineRawData.rename(columns = rename_dict)
```


Many responses had to be turned into np.na so as not to interfere with the data. Any skipped, empty, or unknown responses were turned into N/A.

I used value_counts for the age ranges to see who exactly answered the survey:
What age range do you fall into?
25 to 34       336
55 to 64       325
65 or older    321
35 to 44       268
45 to 54       247
18 to 24        67

Given that we have the fewest responses from the 18- —to 24-year-old group, we will expect all of their bars to fall short by a large margin.

## Results
#### Who's Volunteering?

Notably, right after this, we can see the following for how much time is being spent volunteering:

![[Hours Volunteered.png]]({{'/assets/postImages/post1/Hours-Volunteered.png' | relative_url}})

As expected, senior individuals volunteer the most and work more weekly hours. Interestingly, the 18- to 24-year-old range volunteers less than any other range by far. Given that it's essential for younger individuals to volunteer for some academic programs, we would expect more to volunteer. Potentially, those who are volunteering and pursuing rigorous routes would not typically complete surveys, or the volunteer hours are unevenly distributed. Since fewer respondents are in the 18-—to 24-year-old category, we should expect to see a line a 1/4th to a 1/6th the size of other age groups. Even considering this, we're still seeing less than we would expect. This is potentially a key point to consider when the new Canada Giving Survey is released.

##### Where are we going wrong?

Interestingly, opportunities to improve one's skillset are not necessarily appealing to most volunteers, especially seniors.


![[Skillset.png]]({{'/assets/postImages/post1/Skillset.png' | relative_url}})


This effect is more pronounced in older volunteers. In the past, I have personally found younger individuals to want to volunteer at places that they would eventually like to work at. These younger individuals also want more opportunities to grow their respective skillsets. The 18-—to 24-year-old category seems to fall in line with this experience, as most of them would see some amount of increased appeal through this. 

![[Volunteer Appreciation.png]]({{'/assets/postImages/post1/Volunteer-Appreciation.png' | relative_url}})

In terms of volunteer appreciation, we see that increasing levels of appreciation might not have the impact most coordinators believe it will. Since the distribution seems relatively even across all of the responses, volunteer appreciation is still important, but it does not have a completely positive effect on all volunteers.


#### Challenges

The most commonly selected challenge to volunteering was:

Lack of available time with 410 respondents.
Required too much or too little of my time with 186 respondents.
Lack of flexible scheduling with 139 respondents.
Unclear or unreasonable expectations with 105 respondents.


All of these responses are to be expected. Volunteering requires substantial time, even if it is for a few hours a week. Scheduling was also a common issue I saw. There are only a certain number of shifts available, and often, to receive an afternoon or weekend shift, you might have to start on a weekday during the day shift.

Unclear expectations are also a major issue. It's not uncommon for volunteer positions to have minimal to no training, which often requires the volunteer to fill in the rest. These uncomfortable experiences make volunteers less likely to volunteer in the future.


##### Possible Improvements for Senior Volunteers

Interestingly, for possible improvements, it seems that senior volunteers are not entirely engaged in volunteer appreciation and are not looking for any direct benefit. This is most likely due to seniors volunteering for the sake of helping more than anything else. Volunteering is a way to talk to others, stay engaged, and get out of the house.

Since seniors are not necessarily able or willing to drive to locations to volunteer, they are limited to areas close by. Given this, coordinators should focus on engaging seniors who are nearby. Those senior volunteers who are nearby also most likely know other seniors, meaning we can easily compound our efforts through word-of-mouth recruitment.

Our data is also the best for the senior population, as older individuals were more likely to complete the survey.

### WIP



