<template>
    <div id="app">
        <v-app class="LoginDiv">
                <v-layout
                justify-center
                >
                <v-flex
                    xs12
                    sm8
                    md4
                >
                    <v-card class="elevation-10">
                    <v-toolbar
                        color="primary"
                        dark
                        flat
                        align-center
                    >
                    <v-spacer />
                        <v-toolbar-title class="toolbarTitle">
                            Login
                        </v-toolbar-title>
                    <v-spacer />  
                    </v-toolbar>
                    <v-card-text>
                        <v-form v-model="valid">
                        <v-text-field
                            label="Email"
                            prepend-icon="mdi-account"
                            type="text"
                            v-model="email"
                            required
                            :rules="emailRules"
                        ></v-text-field>

                        <v-text-field
                            v-model="password"
                            :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showpassword ? 'text' : 'password'"
                            label="Password"
                            @click:append="showpassword = !showpassword"
                            prepend-icon="mdi-lock"
                            :rules="passwordRules"
                            required
                        ></v-text-field>
                        </v-form>
                        <v-spacer>
                            <v-btn type="submit" outlined color="primary" @click="logIn" :disabled="!valid"><v-icon>mdi-login-variant</v-icon></v-btn>
                        </v-spacer>
                    </v-card-text>
                    <v-spacer>
                        Don't have an account? <a href="/signUp" style="text-decoration:none">SignUp.</a>
                     </v-spacer>                    
                    </v-card>
                    <v-alert
                    v-if="status != null"
                    :type="status.type"
                    outlined
                    text
                    :icon="status.icon"
                    transition="scale-transition"
                    >{{status.message}}</v-alert>
                </v-flex>
                </v-layout>
        </v-app>
    </div>
</template>
<script>
import firebase from '../config/firebase'
export default {
    data(){
        return{
            status: null,
            valid: true,
            email: "",
            password: "", 
            showpassword: false,
            error: null,
            emailRules: 
            [
                email => !!email || "Email is required",
                email => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) || "Email must be valid"
            ],
            passwordRules:
            [
                password => !!password || "Password is required",
            ]
        }
    },
    methods: {
        logIn()
        {    
            firebase.auth()
            .signInWithEmailAndPassword(this.email.trim(), this.password).then(() => 
            {
                this.$router.replace({ name: "forums" });
            }).catch(err => {
                let errorStatus = 
                {
                    type: 'error',
                    message: err.message,
                    icon: 'mdi-skull-outline'
                }
                this.showStatus(errorStatus)
            });
        },
        showStatus(status)
        {
            this.status = status
            setTimeout(() => {this.status = null}, 3000);
        }
    }
}
</script>

<style scoped>

.toolbarTitle{
    font-size: 180%;
}
.v-alert{
    margin-top: 6%;
}

</style>