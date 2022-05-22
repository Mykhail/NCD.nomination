import {
    u128,
    Context,
    storage,
    PersistentVector,
    ContractPromise,
    logging,
    base64,
    math,
    context
} from 'near-sdk-as';

import uuid from "as-uuid";
import {AccountId} from '../../utils';

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
        public reward: number,
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
}

@nearBindgen
class Candidate {
    constructor(
        public candidate_id: string,
        public experience: string,
        public english_level: string,
        public timezone: string,
        public salary_expectations: string
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

    const vacancy = new Vacancy(1, vacancyDetails, vacancyId);

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
    const candidate = new Candidate(candidateId, experience, english_level, timezone, salary_expectations);
    const candidateContact = new CandidateContact(candidateId, full_name, email, telegram);

    if(!storage.hasKey("candidates_" + vacancyId)){
        createCandidatesPool(vacancyId, candidate);
    }

    if(!storage.hasKey("candidates_contacts_" + candidateId)){
        createCandidatesContactsPool(candidateId, candidateContact);
    }

    const candidatesPool = getCandidatesPool(vacancyId);
    const candidatesContacts = getCandidatesContacts(candidateId);

    candidatesPool.candidates.push(candidate);
    candidatesContacts.candidatContacts.push(candidateContact);
}

function createCandidatesPool(vacancyId: string, candidate: Candidate): void {
    const candidates = new PersistentVector<Candidate>(vacancyId);
    const candidatesPool = new CandidatesPool(vacancyId, candidates);
    saveCandidatesPool(vacancyId, candidatesPool);
}

function saveCandidatesPool(vacancyId: string, candidatesPool: CandidatesPool): void {
    storage.set("candidates_" + vacancyId, candidatesPool);
}

export function getCandidatesPool(vacancyId: string): CandidatesPool {
    return storage.getSome<CandidatesPool>("candidates_" + vacancyId);
}

export function getAllCandidates(vacancyId: string): Candidate[] {
    const candidatesPool = getCandidatesPool(vacancyId);
    return candidatesPool.getCandidates();
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