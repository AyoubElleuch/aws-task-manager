import { signUp,
         resendSignUpCode,
         signIn,
         signOut,
         fetchAuthSession,
         resetPassword,
         confirmResetPassword,
         confirmSignUp,
         getCurrentUser
        } from 'aws-amplify/auth';

export async function register(email: string, password: string) {
    return signUp({
        username: email,
        password,
        options: {
            userAttributes: {
                email,
            },
        },
    })
}

export function confirmRegistration(email: string, code: string) {
    return confirmSignUp({ username: email, confirmationCode: code })
}

export function resendRegistrationCode(email: string) {
    return resendSignUpCode({ username: email })
}

export function login(email: string, password: string) {
    return signIn({
        username: email,
        password,
        options: { 
            authFlowType: 'USER_SRP_AUTH'
        }
    })
}

export function logout() {
    return signOut()
}

export function getSession(forceRefresh = false){
    return fetchAuthSession({ forceRefresh })
}

export function getUser() {
    return getCurrentUser()
}

export function startPasswordReset(email: string) {
    return resetPassword({ username: email })
}

export function finishPasswordReset(
    email: string, code: string, newPassword: string
) {
    return confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
    })
}