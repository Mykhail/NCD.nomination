import {
    u128,
    Context,
    storage,
    PersistentVector,
    ContractPromise,
    logging,
    base64,
    math,
    context,
    ContractPromiseBatch
} from 'near-sdk-as';

import uuid from "as-uuid";
import {AccountId, XCC_GAS} from '../../utils';

/*================Vacancy classes================*/
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

@nearBindgen
class Vacancy {
    constructor(
        public reward: u128,
        public details: VacancyDetails,
        public vacancy_id: string
    ) {}
}

@nearBindgen
class VacancyDetails {
    constructor(
        public position_title: string,
        public requirements: VacancyRequirements,
        public company_id: AccountId
    ) {}
}

@nearBindgen
class VacancyRequirements {
    constructor(
        public experience: string,
        public english_level: string,
        public timezone: string
    ) {}
}

/*================Candidate related classes================*/
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
        private telegram: string,
        private full_name: string,
        private email: string
    ) {}
}

/*================Candidate contact classes================*/
@nearBindgen
class CandidatesContactsPool {
    constructor(
        public candidatId: string,
        public candidatContacts: PersistentVector<CandidateContact>
    ){}

    findContact(candidatId: string):CandidateContact[] {
        const res: CandidateContact[] = [];
        for (let i = 0; i < this.candidatContacts.length; i++) {
            if(this.candidatContacts[i].candidate_id ===candidatId) {
                res.push(this.candidatContacts[i]);
            }
        }
        return res;
    }
}

@nearBindgen
class CandidateContact {
    constructor(
        public candidate_id: string,
        public full_name: string,
        public email: string,
        public telegram: string,
    ) {}
}

/*================ Contract methods -> Vacancy ================*/
//Company posts vacancy
export function postVacancy(
    pool: string, 
    title: string, 
    experience: string, 
    english: string, 
    timezone: string, 
    company_id: string ): void {

    const poolName = pool;
    const vacancyDetails = new VacancyDetails(title, new VacancyRequirements(experience, english, timezone), company_id);
    const vacancyId = "vacancy-" + generateId();
    const amount = context.attachedDeposit;
    const account = context.sender;

    logging.log(Context.contractName);
    logging.log(Context.predecessor);
    logging.log(Context.sender);

    const vacancy = new Vacancy(amount, vacancyDetails, vacancyId);

    if(!storage.hasKey(poolName)){
        createVacanciesPool(poolName, vacancy)
    }

    const vacanciesPool = getVacanciesPool(poolName);
    vacanciesPool.vacancies.push(vacancy);
}

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

//Company or recruiter can get list of all vacations for specific pool
export function getAllVacancies(poolName: string): Vacancy[] {
    const vacanciesPool = getVacanciesPool(poolName);
    return vacanciesPool.getVacancies();
}

export function getVacancyInfo(vacancyId: string, poolName: string): Vacancy | null{ 
    const allVacancies = getAllVacancies(poolName);
    let vacancyInfo!: Vacancy;

    for (var i = 0; i < allVacancies.length; i++) {
        if(allVacancies[i].vacancy_id == vacancyId) {
            vacancyInfo = allVacancies[i];
        }
    }
    return vacancyInfo
}

/*================ Contract methods -> Candidate ================*/
//Recruiter provides depersonalised cv to the company
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
    const candidateId = "candidate-" + generateId();
    const candidate = new Candidate(candidateId, experience, english_level, timezone, salary_expectations, telegram, full_name, email);
    //const candidateContact = new CandidateContact(candidateId, full_name, email, telegram);

    if(!storage.hasKey("candidates_" + vacancyId)){
        createCandidatesPool(vacancyId, "candidates_") ;
    }

    //if(!storage.hasKey("candidates_contacts_" + candidateId)){
    //    createCandidatesContactsPool(candidateId, candidateContact);
    //}

    const candidatesPool = getCandidatesPool(vacancyId, "candidates_");
    //const candidatesContacts = getCandidatesContacts(candidateId);

    candidatesPool.candidates.push(candidate);
    //candidatesContacts.candidatContacts.push(candidateContact);
}

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

export function getAllCandidates(vacancyId: string, poolName:string): Candidate[] {
    const candidatesPool = getCandidatesPool(vacancyId, poolName);
    return candidatesPool.getCandidates();
}

function getCandidateInfo(vacancyId: string, candidateId: string, poolName: string): Candidate { 
    const allCandidates = getAllCandidates(vacancyId, poolName);
    let candidateInfo!: Candidate;

    for (var i = 0; i < allCandidates.length; i++) {
        if(allCandidates[i].candidate_id == candidateId) {
            candidateInfo = allCandidates[i];
        }
    }
    return candidateInfo
}

export function hireCandidate(poolName: string, candidateId: string, vacancyId: string): void {

    const vacancy = getVacancyInfo(vacancyId, poolName);
    const companyId = vacancy ? vacancy.details.company_id : "";
    let hiredCandidate: Candidate = getCandidateInfo(vacancyId, candidateId, "candidates_");

    if(!storage.hasKey("hired_candidates_" + vacancyId)){
        createCandidatesPool(vacancyId, "hired_candidates_");
    }

    const hiredCandidatesPool = getCandidatesPool(vacancyId, "hired_candidates_");
    hiredCandidatesPool.candidates.push(hiredCandidate);

    const candidatesPool = getCandidatesPool(vacancyId, "candidates_");
    candidatesPool.removeCandidate(candidateId);

    if(vacancy && companyId) {
        const to_recruiter = ContractPromiseBatch.create(companyId);
        const self = Context.contractName
        to_recruiter.transfer(vacancy.reward);

        to_recruiter.then(self).function_call("on_payout_complete", "{}", u128.Zero, XCC_GAS);
    }
}

export function on_payout_complete(): void {
    logging.log("candidate has been hired!");
}

/*================ Contract methods -> Contact ================*/
function createCandidatesContactsPool(candidateId: string, candidateContact: CandidateContact): void {
    const candidatesContacts = new PersistentVector<CandidateContact>(candidateId);
    const candidatesContactsPool = new CandidatesContactsPool(candidateId, candidatesContacts);
    saveCandidatesContactsPool(candidateId, candidatesContactsPool);
}

function saveCandidatesContactsPool(candidateId: string, candidatesContactsPool: CandidatesContactsPool): void {
    storage.set("candidates_contacts_" + candidateId, candidatesContactsPool);
}

function getCandidatesContacts(candidateId: string): CandidatesContactsPool {
    return storage.getSome<CandidatesContactsPool>("candidates_contacts_" + candidateId);
}

/*================ Contract methods -> helpers ================*/
function generateId(): string {
    //const title = context.sender.substring(0, context.sender.lastIndexOf('.'))
    //const temp = title + '-' + context.blockIndex.toString();
    return context.blockIndex.toString();
}