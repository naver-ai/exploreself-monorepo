export function assertDate(object: Date | string): Date | undefined | null {
    if(typeof object === 'string'){
        return new Date(object)
    }else{
        return object
    }
}