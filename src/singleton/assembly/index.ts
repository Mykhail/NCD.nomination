import {
    u128,
    Context,
    storage,
    PersistentVector,
    ContractPromise,
} from 'near-sdk-as';


import {AccountId} from '../../utils';

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
        public details: VacancyDetails
    ) {}
}

@nearBindgen
class VacancyDetails {
    constructor(
        public positionTitle: string,
        public requirements: VacancyRequirements,
        public companyId: AccountId
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

//Company posts vacancy
export function createVacanciesPool(poolName: string, vacancy: Vacancy): void {
    const vacancies = new PersistentVector<Vacancy>(poolName);
    const vacanciesPool = new VacanciesPool(poolName, vacancies);
    saveVacanciesPool(poolName, vacanciesPool);
}

//Company posts vacancy
export function postVacancy(): void {
    const poolName = "dev";
    const vacancyDetails = new VacancyDetails("Senior blockchain developer", new VacancyRequirements("5+ years", "fluent", "EST"), "somix11.testnet");
    const vacancy = new Vacancy(1, vacancyDetails);

    if(!storage.hasKey(poolName)){
        createVacanciesPool(poolName, vacancy)
    }

    const vacanciesPool = getVacanciesPool(poolName);
    vacanciesPool.vacancies.push(vacancy);
}

function saveVacanciesPool(poolName: string, vacanciesPool: VacanciesPool): void {
    storage.set(poolName, vacanciesPool);
}

export function getVacanciesPool(poolName: string): VacanciesPool {
    return storage.getSome<VacanciesPool>(poolName);
}

export function getAllVacancies(poolName: string): Vacancy[] {

    const vacanciesPool = getVacanciesPool(poolName);;
    return vacanciesPool.getVacancies();
}

/*
//Recruiter provides depersonalised cv to the company
export function postCandidate(): void {

}

export function generateVacancyId(): string {
    return '_' + Math.random().toString(36).substr(2, 3);
};

export function generateCandidateId(): string {
    return '_' + Math.random().toString(36).substr(2, 5);
};

export function test(): string {
    return 'test112311';
};
*/
//=====================================================================================================================
/*
@nearBindgen
export class Contract {
  private message: string = 'hello world'

  // return the string 'hello world'
  helloWorld(): string {
    return this.message
  }

  // read the given key from account (contract) storage
  read(key: string): string {
    if (isKeyInStorage(key)) {
      return `✅ Key [ ${key} ] has value [ ${storage.getString(key)!} ] and "this.message" is [ ${this.message} ]`
    } else {
      return `🚫 Key [ ${key} ] not found in storage. ( ${this.storageReport()} )`
    }
  }
*/
  /**
  write the given value at the given key to account (contract) storage
  ---
  note: this is what account storage will look like AFTER the write() method is called the first time
  ╔════════════════════════════════╤══════════════════════════════════════════════════════════════════════════════════╗
  ║                            key │ value                                                                            ║
  ╟────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────╢
  ║                          STATE │ {                                                                                ║
  ║                                │   "message": "data was saved"                                                    ║
  ║                                │ }                                                                                ║
  ╟────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────╢
  ║                       some-key │ some value                                                                       ║
  ╚════════════════════════════════╧══════════════════════════════════════════════════════════════════════════════════╝
   */

/*
  @mutateState()
  write(key: string, value: string): string {
    storage.set(key, value)
    this.message = 'data was saved' // this is why we need the deorator @mutateState() above the method name
    return `✅ Data saved. ( ${this.storageReport()} )`
  }


  // private helper method used by read() and write() above
  private storageReport(): string {
    return `storage [ ${Context.storageUsage} bytes ]`
  }
}
*/

/**
 * This function exists only to avoid a compiler error
 *

ERROR TS2339: Property 'contains' does not exist on type 'src/singleton/assembly/index/Contract'.

     return this.contains(key);
                 ~~~~~~~~
 in ~lib/near-sdk-core/storage.ts(119,17)

/Users/sherif/Documents/code/near/_projects/edu.t3/starter--near-sdk-as/node_modules/asbuild/dist/main.js:6
        throw err;
        ^

 * @param key string key in account storage
 * @returns boolean indicating whether key exists
 */
//function isKeyInStorage(key: string): bool {
//  return storage.hasKey(key)
//}
