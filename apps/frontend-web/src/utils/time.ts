export function assertDate(object: Date | string): Date {
    if(typeof object === 'string'){
        return new Date(object)
    }else{
        return object
    }
}