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
                                    label="Name*"
                                    required
                                    :rules="nameRules"
                                    v-model="name"
                                    prepend-icon="mdi-account-circle"
                                    type="text"
                                ></v-text-field>
                                <v-text-field
                                    label="Lastname*"
                                    required
                                    :rules="lastnameRules"
                                    v-model="lastname"
                                    prepend-icon="mdi-account-circle"
                                    type="text"
                                ></v-text-field>
                                <v-text-field
                                    label="Email*"
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
                                    :rules="newPasswordRules"
                                    label="New Password"
                                    @click:append="showpassword = !showpassword"
                                    prepend-icon="mdi-lock"
                                ></v-text-field>
                            </v-form>
                            <small>*indicates required field</small>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer>
                                <v-btn type="submit" outlined color="primary" @click="confirmPassword = true"  :disabled="!valid">submit <v-icon right>mdi-login-variant</v-icon></v-btn>
                            </v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-app>
        <v-dialog
            v-model="confirmPassword"
            width="500"
            >
             <v-card>
                <v-card-title primary-title>
                     Confirm Password
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="currentPassword"
                        :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        label="Current Password"
                        @click:append="showCurrentPassword = !showCurrentPassword"
                        prepend-icon="mdi-lock"
                        @keyup.enter="updateAccount"
                    ></v-text-field>
                    <small>Please enter your password to confirm your changes.</small>
                </v-card-text>
                    <v-alert
                        v-if="status != null"
                        :type="status.type"
                        outlined
                        text
                        :icon="status.icon"
                        transition="scale-transition"
                        >{{status.message}}
                    </v-alert>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="confirmPassword = false">Close</v-btn>
                    <v-btn type="submit" text color="primary"  @click="updateAccount" >Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import firebase from '../config/firebase'
import { mapGetters } from "vuex";
export default {
    name: "updateaccount",
    data(){
        return{
            status: null,
            confirmPassword: false,  
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
            ],
            newPasswordRules:
            [
                password => ((/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/.test(password)) || password.length == 0)  || "The password must contain at least 8 and no more than 16 characters, at least one digit, at least one lower case and at least one upper case.\nIt can NOT have any other symbol."
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
        async updateAccount()
        {   
            try {
                
                let user = firebase.auth().currentUser
                var credential = firebase.auth.EmailAuthProvider.credential(user.email, this.currentPassword)
                this.currentPassword = ""
                let oldEmail = user.email.toString()
                if(oldEmail != this.email)
                {
                    let db = this.db
                    let newEmail = this.email.toString()
                    let newName = this.name.toString()
                    let newLastName = this.lastname.toString()
                    user.reauthenticateWithCredential(credential).then(() => 
                    {
                        user.updateEmail(this.email).then(function() 
                        {
                            console.log("Se actualizó el email")
                            db.collection('users').doc(oldEmail).get().then((userdb) =>
                            {
                                let nameDoc = newName
                                let lastNameDoc = newLastName
                                let activeDoc = userdb.data().active
                                let numEntriesDoc = userdb.data().numEntries
                                console.log("Email nuevo: " + newEmail)
                                console.log("Email viejo: " + oldEmail)
                                console.log(userdb)
                                db.collection('users').doc(newEmail).set(
                                {
                                    name: nameDoc,
                                    lastname: lastNameDoc,
                                    active: activeDoc,
                                    numEntries: numEntriesDoc
                                }).then(() => 
                                {
                                    db.collection('entries').get().then((entries) =>
                                    {
                                        entries.forEach(entry => 
                                        {
                                            if(entry.data().creator.id === oldEmail)
                                            {
                                                console.log("se actualizó un entry")
                                                let refCreator = db.collection('users').doc(newEmail)
                                                db.collection('entries').doc(entry.id).update({creator: refCreator})
                                            }
                                        });
                                    })
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
                        let updateStatus  = 
                                        {
                                            type: 'success',
                                            message: 'Your personal info was updated successfully',
                                            icon: 'mdi-checkbox-marked-circle-outline'
                                        }
                                    this.showStatus(updateStatus)
                    }).catch((err) => 
                    {
                         let updateStatus  = 
                        {
                            type: 'error',
                            message: err.message,
                            icon: 'mdi-skull-outline'
                        }
                        this.showStatus(updateStatus)
                    });
                }else{
                    let db =  this.db
                    let newName = this.name.toString()
                    let newLastName = this.lastname.toString()
                    let authPromise = user.reauthenticateWithCredential(credential)
                    let updateStatus = ""
                    
                    await authPromise.then(()=>{

                        db.collection('users').doc(oldEmail).update({
                        name: newName,
                        lastname: newLastName
                        }).then(() =>{
                            updateStatus  = 
                            {
                                type: 'success',
                                message: 'Your personal info was updated successfully',
                                icon: 'mdi-checkbox-marked-circle-outline'
                            }
                            this.showStatus(updateStatus)
                        }).catch((err)=>{
                         updateStatus  = 
                        {
                            type: 'error',
                            message: err.message,
                            icon: 'mdi-skull-outline'
                        }
                        this.showStatus(updateStatus)
                    });
                        
                    }).catch((err)=>{
                         updateStatus  = 
                        {
                            type: 'error',
                            message: err.message,
                            icon: 'mdi-skull-outline'
                        }
                        this.showStatus(updateStatus)
                    });        
                }
                
                if (this.password != "" ) 
                {
                    user.reauthenticateWithCredential(credential).then(() => 
                    {
                        user.updatePassword(this.password).then(function() 
                        {
                            
                        }).catch(function(error) {
                            let replyStatus  = 
                            {
                                type: 'error',
                                message: error.message,
                                icon: 'mdi-skull-outline'
                            }
                            this.showStatus(replyStatus)
                        });
                    })
                }
            } catch (error) {
                let replyStatus  = 
                {
                    type: 'error',
                    message: error.message,
                    icon: 'mdi-skull-outline'
                }
                this.showStatus(replyStatus)
            }
        },
        refreshUser()
        {
            this.$store.dispatch("fetchUser", firebase.auth().currentUser);
        },
        showStatus(status)
        {
           
            if(this.status != null){
                setTimeout(() => {
                     this.status = status
                    if(status.type === "error")
                        {
                            setTimeout(() => {this.status = null}, 3000);
                        }
                        else if(status.type === "success")
                        {
                            setTimeout(() => {this.status = null; this.confirmPassword = false; this.$router.replace({name: "forums"});}, 3000);
                        }
                    }, 3000);
            }else{
                 this.status = status
                    if(status.type === "error")
                        {
                            setTimeout(() => {this.status = null}, 3000);
                        }
                        else if(status.type === "success")
                        {
                            setTimeout(() => {this.status = null; this.confirmPassword = false; this.$router.replace({name: "forums"});}, 3000);
                        }
            }
            
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
.obligatoryPassword{
    margin-top: 5%;
    
}
.v-card__title{
    background-color: #1976d2;
    color: white;
}

.v-card__subtitle{
    margin-top: 5%;
}

</style>