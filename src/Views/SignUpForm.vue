<template>
    <div id="app">
        <v-app class="LoginDiv" >
            <v-layout justify-center>
                <v-flex xs12 sm8 md4>
                    <v-card v-if="user" class="elevation-12">
                        <v-toolbar color="primary" dark flat align-center>
                            <v-spacer />
                                <v-toolbar-title class="toolbarTitle">
                                    Sign Up
                                </v-toolbar-title>
                            <v-spacer />  
                        </v-toolbar>
                        <v-card-text>
                            <v-form v-model="valid">
                                <v-text-field
                                    label="Name"
                                    required
                                    :rules="nameRules"
                                    v-model="name"
                                    prepend-icon="mdi-account-circle"
                                    type="text"
                                ></v-text-field>
                                <v-text-field
                                    label="Lastname"
                                    required
                                    :rules="lastnameRules"
                                    v-model="lastname"
                                    prepend-icon="mdi-account-circle"
                                    type="text"
                                ></v-text-field>
                                <v-text-field
                                    label="Email"
                                    required
                                    :rules="emailRules"
                                    v-model="email"
                                    prepend-icon="mdi-email"
                                    type="email"
                                ></v-text-field>
                                <v-text-field
                                    v-model="password"
                                    :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="showpassword ? 'text' : 'password'"
                                    :rules="passwordRules"
                                    label="Password"
                                    @click:append="showpassword = !showpassword"
                                    prepend-icon="mdi-lock"
                                ></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer>
                                <v-btn type="submit" outlined color="primary" @click="signUp" :disabled="!valid" >Submit <v-icon right>mdi-login-variant</v-icon></v-btn>
                            </v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-app>
    </div>
</template>

<script>
import firebase from '../config/firebase'
import { mapGetters } from "vuex";
export default {
    data(){
        return{
            db: firebase.firestore(),
            name: "",
            lastname: "",
            email: "",
            password: "",
            valid: true,
            showpassword: false,
            nameRules: 
            [
                name => !!name || "Name is required",
                name => name.length > 3 || "Name must be longer than 3 characters"
            ],
            lastnameRules: 
            [
                lastname => !!lastname || "Lastname is required",
                lastname => lastname.length > 3 || "Name must be longer than 3 characters"
            ],
            emailRules: 
            [
                email => !!email || "Email is required",
                email => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) || "Email must be valid"
            ],
            passwordRules:
            [
                password => !!password || "Password is required",
                password => /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/.test(password) || "The password must contain at least 8 and no more than 16 characters, at least one digit, at least one lower case and at least one upper case.\nIt can NOT have any other symbol."
            ]
        }
    },
    methods: {
        signUp(){ 
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(() => 
            {
                this.db.collection('users').doc(this.email.toLowerCase()).set(
                {
                    name: this.name,
                    lastname: this.lastname,
                    active: true
                })
                .then(() => 
                {
                    this.$router.replace(
                    {
                        name: "forums"
                    });
                }).catch(err => {
                    console.log(err.message)
                })
            }).catch(err => {
                console.log(err.message)
            });
            
        }
    },
    computed: {
    ...mapGetters({
    user: "user"
    })
    }
}
</script>

<style>
.LoginDiv{
    padding-top: 5%;
}
.toolbarTitle{
    font-size: 180%;
}
</style>