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
                    <v-card class="elevation-12">
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
                        <v-form>
                        <v-text-field
                            label="Email"
                            prepend-icon="mdi-account"
                            type="text"
                            v-model="email"
                        ></v-text-field>

                        <v-text-field
                            v-model="password"
                            :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showpassword ? 'text' : 'password'"
                            label="Password"
                            @click:append="showpassword = !showpassword"
                            prepend-icon="mdi-lock"
                        ></v-text-field>
                        </v-form>
                        <v-spacer>
                            <v-btn type="submit" outlined color="primary" @click="logIn()"><v-icon>mdi-login-variant</v-icon></v-btn>
                        </v-spacer>
                    </v-card-text>
                    <v-spacer>
                        Don't have an account? <a href="/signUp" style="text-decoration:none">SignUp.</a>
                     </v-spacer>
                   
                    <v-card-actions>
                        
                    </v-card-actions>
                    
                    </v-card>
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
            email: "",
            password: "", 
            showpassword: false,
            error: null
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
                alert(err.message)
                this.error = err.message;
            });
        }
    }
}
</script>

<style scoped>

.toolbarTitle{
    font-size: 180%;
}

</style>