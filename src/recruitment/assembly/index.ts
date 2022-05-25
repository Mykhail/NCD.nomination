import {
    u128,
    Context,
    storage,
    PersistentVector,
    logging,
    ContractPromiseBatch
} from 'near-sdk-as';

import {AccountId, XCC_GAS, VACANCY_PREFIX, CANDIDATES_PREFIX, HIRED_CANDIDATES_PREFIX, generateId} from '../../utils';

/**************************************************************************
 *************************** Vacancy classes ******************************
 /************************************************************************/

 /**
 * @class VacanciesPool
 * @property poolName  - pool ID of the vacancies pool
 * @property vacancies  - list of vacancies for the specific pool
 *
 * Vacancy pool keep all vacancies of the company
 */
@nearBindgen
class VacanciesPool {
    constructor(
        public poolName: string,
        public vacancies: PersistentVector<Vacancy>
    ){}

    getVacancies():Vacancy[] {
        const res: Vacancy[] = [];
        for (let i = 0; i < this.vacancies.length; i++) {
            res.push(this.vacancies[i]);
        }
        return res;
    }
}

 /**
 * @class Vacancy
 * @property reward      - reward that company pays to recruiter who "close" this vacation
 * @property details     - position requirements
 * @property vacancy_id  - Vacancy ID
 *
 * Class that represents a single vacancy 
 */
@nearBindgen
class Vacancy {
    constructor(
        public reward: u128,
        public details: VacancyDetails,
        public vacancy_id: string
    ) {}
}

 /**
 * @class VacancyDetails
 * @property position_title   - title of the vacancy e.g "BE Senior"
 * @property requirements     - position requirements 
 * @property company_id       - Company ID is a near account ID
 *
 * Class that kepp vacancy details
 */
@nearBindgen
class VacancyDetails {
    constructor(
        public position_title: string,
        public requirements: VacancyRequirements,
        public company_id: AccountId
    ) {}
}

 /**
 * @class VacancyRequirements
 * @property experience        - needed experience 
 * @property english_level     - desired english level 
 * @property timezone          - desired timezone
 *
 * Class that kepp more detailed vacancy requirements
 */
@nearBindgen
class VacancyRequirements {
    constructor(
        public experience: string,
        public english_level: string,
        public timezone: string
    ) {}
}

/**************************************************************************
 *************************** Candidate classes ****************************
 /************************************************************************/
@nearBindgen
class CandidatesPool {
    constructor(
        public vacancyId: string,
        public candidates: PersistentVector<Candidate>
    ){}

    getCandidates():Candidate[] {
        const res: Candidate[] = [];
        if (this.candidates) {
            for (let i = 0; i < this.candidates.length; i++) {
                res.push(this.candidates[i]);
            }
        }
        return res;
    }

    getDepersonalizedCandidates():DepersonalizedCandidate[] {
        const res: DepersonalizedCandidate[] = [];
        if (this.candidates) {
            for (let i = 0; i < this.candidates.length; i++) {
                let depersonalizedCandidate: DepersonalizedCandidate = new DepersonalizedCandidate(
                    this.candidates[i].candidate_id,
                    this.candidates[i].experience,
                    this.candidates[i].english_level,
                    this.candidates[i].timezone,
                    this.candidates[i].salary_expectations)

                res.push(depersonalizedCandidate);
            }
        }
        return res;
    }

    removeCandidate(candidateId: string): void {
        
        let index!: i32;
        for (let i = 0; i < this.candidates.length; i++) {
            if(this.candidates[i].candidate_id == candidateId) {
                index = i;
            }
        }

        if (index > -1) {
            this.candidates.swap_remove(index);
        }

    }
}

@nearBindgen
class Candidate {
    constructor(
        public candidate_id: string,
        public experience: string,
        public english_level: string,
        public timezone: string,
        public salary_expectations: string,
        public telegram: string,
        public full_name: string,
        public email: string
    ) {}
}

@nearBindgen
class DepersonalizedCandidate {
    constructor(
        public candidate_id: string,
        public experience: string,
        public english_level: string,
        public timezone: string,
        public salary_expectations: string,
    ) {}
}

/**
 * Recruitment contract API
 * ========================
 */

/**
 * @function postVacancy
 * @param pool         - vacancy pool, e.g. "Developers", "QA" etc
 * @param title        - vacancy title, e.g. "BE developer Senior"
 * @param experience   - required experience
 * @param english      - english level
 * @param timezone     - desired timezone
 * @param company_id   - Near account is used as a company identifier
 * 
 *  Post Vacancy to the defined Vacancies pool
 *  
 *  Hiring manager creates a new vacancy within defined vacancies's pool and define reward for the recruitement agency.
 *  If vacancies pool doesn't exist, it will be created automatically.
 *  e.g post vacancy for hiring "BE developer Senior" to the vacancy pool "Developers"
 *  near call {{CONTRACT_NAME}} postVacancy '{"pool": "Developers", "title": "BE developer Senior", "experience":"5+", "english": "fluent", "timezone": "EST", "company_id": "somix11.testnet" }' --accountId="somix11.testnet" --amount 3
 */


export function postVacancy(
    pool: string, 
    title: string, 
    experience: string, 
    english: string, 
    timezone: string, 
    company_id: string ): void {

    const poolName = pool;
    const vacancyDetails = new VacancyDetails(title, new VacancyRequirements(experience, english, timezone), company_id);
    const vacancyId = VACANCY_PREFIX + generateId();
    const amount = Context.attachedDeposit;
    const ONE_NEAR = u128.from('1000000000000000000000000');

    assert(
        u128.ge(Context.attachedDeposit, ONE_NEAR),
        'Minimum 1 NEAR must be attached to post a vacancy'
      );

    const vacancy = new Vacancy(amount, vacancyDetails, vacancyId);

    if(!storage.hasKey(poolName)){
        createVacanciesPool(poolName, vacancy)
    }

    const vacanciesPool = getVacanciesPool(poolName);
    vacanciesPool.vacancies.push(vacancy);
}

/**
 * @function getAllVacancies
 * @param poolName         - poolName, e.g. "Developers", "QA" etc
 * 
 *  Returns a list of open vacancies for the specified pool
 *  Functional specification:
 *  Recruitement company get the list of the open vacancies and start looking candidates for the company
 *  near view {{CONTRACT}} getAllVacancies '{"poolName": "BE developers"}' --accountId={{accountId}}
 */
export function getAllVacancies(poolName: string): Vacancy[] {
    const vacanciesPool = getVacanciesPool(poolName);
    return vacanciesPool.getVacancies();
}

/**
 * @function postCandidate
 * @param vacancy_id            - vacancy pool, e.g. "Developers", "QA" etc
 * @param experience            - candidate's info - experience
 * @param english_level         - candidate's info - english level
 * @param timezone              - candidate's info - english level
 * @param salary_expectations   - candidate's info - salary_expectations
 * @param full_name             - candidate's info - full name
 * @param email                 - candidate's info - email
 * @param telegram              - candidate's info - telegram
 * 
 *  Recruiter adds candidate's data to the contract
 *  Functional specification:
 *  Recruiter provides candidate's profile to the company. 
 *  Hiring manager will be able to check candidate info, but not contact information.
 *  near call {{CONTRACT}} postCandidate '{"vacancy_id": "{{COPY FROM A VACANCY OBJECT}}", "experience": "4 years with BE, 1 year TL", "english_level":"Upper-Intermediate", "timezone": "EST", "salary_expectations": "5000USD", "full_name": "John Galt", "email": "whoisjgalt@gmail.com", "telegram": "@JohnGalt" }' --accountId={{ACCOUNT_ID}}
 */
export function postCandidate(
    vacancy_id: string, 
    experience: string,
    english_level: string,
    timezone: string,
    salary_expectations: string,
    full_name: string,
    email: string,
    telegram: string): void {

    const vacancyId = vacancy_id;
    const candidateId = CANDIDATES_PREFIX + generateId();
    const candidate = new Candidate(candidateId, experience, english_level, timezone, salary_expectations, telegram, full_name, email);
    
    if(!storage.hasKey(CANDIDATES_PREFIX + vacancyId)){
        createCandidatesPool(vacancyId, CANDIDATES_PREFIX) ;
    }

    const candidatesPool = getCandidatesPool(vacancyId, CANDIDATES_PREFIX);
    candidatesPool.candidates.push(candidate);
}

/**
 * @function getCandidates
 * @param vacancyId         - vacancy ID
 * @param poolName          - poolName, e.g. "Developers", "QA" etc
 * 
 *  Returns a list of candidates for the specific vacancy
 *  Functional specification:
 *  Hiring manager get the list of candodates for the specific vacancy to check if a profile suite needs of the company or not
 *  near view cert.somix11.testnet getDepersonalizedCandidates '{"vacancyId": "{{COPY FROM A VACANCY OBJECT}}", "poolName": "candidates_"}' --accountId="{{ACCOUNT_ID}}"
 */
export function getCandidates(vacancyId: string): DepersonalizedCandidate[] {
    const candidatesPool = getCandidatesPool(vacancyId, CANDIDATES_PREFIX);
    return candidatesPool.getDepersonalizedCandidates();
}

/**
 * @function hireCandidate
 * @param poolName          - poolName, e.g. "Developers", "QA" etc
 * @param candidateId       - candidate ID
 * @param vacancyId         - vacancy ID
 * 
 *  Initiate candidate's hiring
 *  Functional specification:
 *  Hiring manager confirms that the candidates meets position requirements and initiate hiring process
 *  Rewards automatically transfered to the recruiting agency 
 *  Contact data appears in the pool "Hired candidates"
 *  near call {{CONTRACT}} hireCandidate '{"poolName": "BE developers", "candidateId": "candidate-90622853", "vacancyId":"vacancy-90622188"}' --accountId="{{ACCOUNT_ID}}"
 */
export function hireCandidate(poolName: string, candidateId: string, vacancyId: string): void {

    const vacancy = getVacancyInfo(vacancyId, poolName);
    const companyId = vacancy ? vacancy.details.company_id : "";
    let hiredCandidate: Candidate = getCandidateInfo(vacancyId, candidateId, CANDIDATES_PREFIX);

    if(!storage.hasKey(HIRED_CANDIDATES_PREFIX + vacancyId)){
        createCandidatesPool(vacancyId, HIRED_CANDIDATES_PREFIX);
    }

    const hiredCandidatesPool = getCandidatesPool(vacancyId, HIRED_CANDIDATES_PREFIX);
    hiredCandidatesPool.candidates.push(hiredCandidate);

    const candidatesPool = getCandidatesPool(vacancyId, CANDIDATES_PREFIX);
    candidatesPool.removeCandidate(candidateId);

    if(vacancy && companyId) {
        const to_recruiter = ContractPromiseBatch.create(companyId);
        const self = Context.contractName
        to_recruiter.transfer(vacancy.reward);
        logging.log(hiredCandidate)
        
        to_recruiter.then(self).function_call("on_hiring_complete", "{}", u128.Zero, XCC_GAS);
    }
}

/**
 * @function getHiredCandidates
 * @param vacancyId         - vacancy ID
 * 
 *  Returns list of hired candidates
 *  Functional specification:
 *  Hiring manager checks list of all hired candidates for the specific vacancy
 *  near call {{CONTRACT}} hireCandidate '{"poolName": "BE developers", "candidateId": "candidate-90622853", "vacancyId":"vacancy-90622188"}' --accountId="{{ACCOUNT_ID}}"
 */
export function getHiredCandidates(vacancyId: string): Candidate[] {
    const candidatesPool = getCandidatesPool(vacancyId, HIRED_CANDIDATES_PREFIX);
    return candidatesPool.getCandidates();
}

/**************************************************************************
 ******************* Private contract methods -> Vacancy ****************
 /************************************************************************/

function createVacanciesPool(poolName: string, vacancy: Vacancy): void {
    const vacancies = new PersistentVector<Vacancy>(poolName);
    const vacanciesPool = new VacanciesPool(poolName, vacancies);
    saveVacanciesPool(poolName, vacanciesPool);
}

function saveVacanciesPool(poolName: string, vacanciesPool: VacanciesPool): void {
    storage.set(poolName, vacanciesPool);
}

function getVacanciesPool(poolName: string): VacanciesPool {
    return storage.getSome<VacanciesPool>(poolName);
}

function getVacancyInfo(vacancyId: string, poolName: string): Vacancy | null{ 
    const allVacancies = getAllVacancies(poolName);
    let vacancyInfo!: Vacancy;

    for (var i = 0; i < allVacancies.length; i++) {
        if(allVacancies[i].vacancy_id == vacancyId) {
            vacancyInfo = allVacancies[i];
        }
    }
    return vacancyInfo
}

/**************************************************************************
 ******************* Private contract methods -> Candidate ****************
 /************************************************************************/

function createCandidatesPool(vacancyId: string, poolName:string): void {
    const candidates = new PersistentVector<Candidate>(poolName + vacancyId);
    const candidatesPool = new CandidatesPool(vacancyId, candidates);
    saveCandidatesPool(vacancyId, candidatesPool, poolName);
}

function saveCandidatesPool(vacancyId: string, candidatesPool: CandidatesPool, poolName:string): void {
    storage.set(poolName + vacancyId, candidatesPool);
}

function getCandidatesPool(vacancyId: string, poolName: string): CandidatesPool {
    return storage.getSome<CandidatesPool>(poolName + vacancyId);
}

function getCandidatesList(vacancyId: string, poolName:string): Candidate[] {
    const candidatesPool = getCandidatesPool(vacancyId, poolName);
    return candidatesPool.getCandidates();
}

function getCandidateInfo(vacancyId: string, candidateId: string, poolName: string): Candidate { 
    const allCandidates = getCandidatesList(vacancyId, poolName);
    let candidateInfo!: Candidate;

    for (var i = 0; i < allCandidates.length; i++) {
        if(allCandidates[i].candidate_id == candidateId) {
            candidateInfo = allCandidates[i];
        }
    }
    return candidateInfo
}

export function on_hiring_complete(): void {
    logging.log("candidate has been hired!");
}