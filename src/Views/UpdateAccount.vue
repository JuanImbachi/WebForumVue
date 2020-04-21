<template>
    <div id="app">
        <v-app class="LoginDiv" >
            <v-layout justify-center>
                <v-flex xs12 sm8 md4>
                    <v-card v-if="user" class="elevation-12">
                        <v-toolbar color="primary" dark flat align-center>
                            <v-spacer />
                                <v-toolbar-title class="toolbarTitle">
                                    Update Account
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
                                    v-model="currentPassword"
                                    :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="showCurrentPassword ? 'text' : 'password'"
                                    :rules="passwordRules"
                                    label="Current Password"
                                    @click:append="showCurrentPassword = !showCurrentPassword"
                                    prepend-icon="mdi-lock"
                                ></v-text-field>
                                <v-text-field
                                    v-model="password"
                                    :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="showpassword ? 'text' : 'password'"
                                    :rules="passwordRules"
                                    label="New Password"
                                    @click:append="showpassword = !showpassword"
                                    prepend-icon="mdi-lock"
                                ></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer>
                                <v-btn type="submit" outlined color="primary" @click="updateAccount" :disabled="!valid" >submit <v-icon right>mdi-login-variant</v-icon></v-btn>
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
            currentPassword: "",
            submitted: false,
            valid: true,
            showpassword: false,
            showCurrentPassword: false,
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
        refresh()
        {
            let user = firebase.auth().currentUser
                this.db.collection('users').doc(user.email).get().then((userdb) =>
                {
                    this.name = userdb.data().name
                    this.lastname = userdb.data().lastname
                    this.email = userdb.id
                }).catch(error => {
                    console.log(error.message)
                })
        },
        updateAccount()
        {
            let user = firebase.auth().currentUser
            var credential = firebase.auth.EmailAuthProvider.credential(user.email, this.currentPassword)
            let oldEmail = user.email.toString()
            user.reauthenticateWithCredential(credential).then(() => 
            {
                if(oldEmail != this.email)
                {
                    let db = this.db
                    let newEmail = this.email
                    let newName = this.name
                    let newLastName = this.lastname
                    user.updateEmail(this.email).then(function() 
                    {
                        console.log("Se actualizó el email")
                        db.collection('users').doc(oldEmail).get().then((userdb) =>
                        {
                            let nameDoc = newName
                            let lastNameDoc = newLastName
                            let activeDoc = userdb.data().active
                            console.log("Email nuevo: " + newEmail)
                            console.log("Email viejo: " + oldEmail)
                            console.log(userdb)
                            db.collection('users').doc(newEmail).set(
                            {
                                name: nameDoc,
                                lastname: lastNameDoc,
                                active: activeDoc
                            }).then(() => 
                            {
                                console.log("se creó un documento nuevo")
                                db.collection('users').doc(oldEmail).delete()
                            }).catch(error => 
                            {
                                console.log("Erro al crear doc nuevo :" + error.message)
                            })
                        })
                        console.log("updatedemail")
                    
                    }).catch(function(error) {
                        console.log(error.message)
                    });
                }
                user.updatePassword(this.password).then(function() 
                {
                    console.log("updatedpassword")
                }).catch(function(error) {
                    console.log(error.message)
                });
                
                
            }).catch((err) => {
                console.log(err.message)
            });
        }
    },
    computed: {
    ...mapGetters({
    user: "user"
    })
    },
    mounted(){
        this.refresh()
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