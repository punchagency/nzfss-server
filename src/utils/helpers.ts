export const isAdmin = (role:string) => {
    return role?.includes('ADMIN');
}