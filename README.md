# ExploreSelf
This is a monorepo codebase of an ACM CHI 2025 paper, "**ExploreSelf: Fostering User-driven Exploration and Reflection on Personal Challenges with Adaptive Guidance by Large Language Models**."

Visit project website at https://naver-ai.github.io/exploreself



## Build

### System Prerequisites
1. Install NodeJS LTS; recommend using NVM (https://github.com/nvm-sh/nvm)
1. Install MongoDB (https://www.mongodb.com/docs/manual/administration/install-community/)
   - Mongodb service should be started manually after installation:
        * Mac:
            ```
            > brew services start mongodb-community
            ```
1. Install NX globally
    ```sh
    > npm install -g nx
    ```
1. Prepare for a `OpenAI API key` at https://platform.openai.com/.

    Copy and paste the API key somewhere. The key will be used in the next step.

### Installation
1. In the repository, install node dependencies:
    ```sh
    > npm install
    ```
1. Run setup process (`OpenAI API key` will be asked to enter):
    ```sh
    > nx run setup
    ```

1. Run the server in dev mode:
    ```sh
    > npm run dev
    ```

1. Visit http://localhost:4200 on a web browser.
   - Enter 12345 as a passcode for the test account.

### Creating a user account
1. Visit http://localhost:4200/admin
1. Enter the admin password you entered in the setup process.
1. Press 'Create user'


## Cite ExploreSelf

### ACM Citation

Inhwa Song, SoHyun Park, Sachin R. Pendse, Jessica Lee Schleider, Munmun De Choudhury, and Young-Ho Kim. 2025.
ExploreSelf: Fostering User-driven Exploration and Reflection on Personal Challenges with Adaptive Guidance by Large Language Models.
In CHI Conference on Human Factors in Computing Systems (CHI ’25)
https://doi.org/10.1145/3706598.3713883


### BibTex
```bibtex
@inproceedings{song2025exploreself,
  author = {Inhwa Song and SoHyun Park and Sachin R. Pendse and Jessica Lee Schleider and Munmun De Choudhury and Young-Ho Kim},
  title = {ExploreSelf: Fostering User-driven Exploration and Reflection on Personal Challenges with Adaptive Guidance by Large Language Models},
  year = {2025},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/3706598.3713883},
  doi = {10.1145/3706598.3713883},
  booktitle = {Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems},
  location = {Yokohama, Japan},
  series = {CHI '25}
}
```


## Research Team (In the order of paper authors)
* **Inhwa Song** (Undergraduate student at KAIST) https://inhwasong.com/
* **SoHyun Park** (Researcher at NAVER Cloud)
* **Sachin R. Pendse** (Postdoctoral Fellow at Northwestern University) https://www.sachinpendse.in/
* **Jessica Lee Schleider** (Associate Professor at Northwestern University) https://www.schleiderlab.org/labdirector.html
* **Munmun De Choudhury** (Associate Professor at Georgia Institute of Technology) http://www.munmund.net/
* **Young-Ho Kim** (Research Scientist at NAVER AI Lab) http://younghokim.net *Corresponding author

## Code Contributors
* **Inhwa Song** (Undergraduate student at KAIST) https://inhwasong.com/
* **Young-Ho Kim** (Research Scientist at NAVER AI Lab) http://younghokim.net
