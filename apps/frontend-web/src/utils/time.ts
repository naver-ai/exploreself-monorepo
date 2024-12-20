export function convertStringTimestampToDate(object: any): any {
    for(const key of Object.keys(object)){
        switch(key){
            case 'createdAt':
            case 'updatedAt':
                if(typeof object[key] === 'string'){
                    object[key] = new Date(object[key])
                }
                break;
        }
    }
    return object
}