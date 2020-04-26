<template>
  <v-toolbar dark src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
    <v-toolbar-items>
      <v-icon style="margin-right:5%">mdi-forum</v-icon>
      <v-btn to="/users" text>Users</v-btn>
      <v-btn to="/forums" text>Forums</v-btn>
    </v-toolbar-items>

    <v-spacer></v-spacer>
    
    <v-toolbar-items>
      <template v-if="user.loggedIn">
        <v-btn text  color="white">{{user.data.email}}</v-btn>
        
        <v-menu transition="slide-y-transition" offset-y>
        <template v-slot:activator="{ on }">
          <v-btn  text  v-on="on"><v-icon >mdi-menu</v-icon></v-btn>
        </template>
        
          <v-list dense align=left>
            <v-list-item @click="editAccount">
              <v-list-item-title> <v-icon left> mdi-account-edit-outline</v-icon>Edit Account</v-list-item-title>
            </v-list-item>

            <v-list-item @click="signOut">
              <v-list-item-title> <v-icon left> mdi-close-octagon-outline</v-icon>Sign Out</v-list-item-title>
            </v-list-item>

            <v-list-item @click="deleteOption = true">
              <v-list-item-title> <v-icon left> mdi-close-octagon-outline</v-icon>Delete Account</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>


      </template>
      <template v-else>
        <v-btn to="/logIn" text>
          <v-icon left>mdi-account-circle</v-icon>Login
        </v-btn>
        <v-btn to="/signUp" text>
          <v-icon left>mdi-account-plus</v-icon>Sign Up
        </v-btn>
      </template>
    </v-toolbar-items>
    <v-dialog v-model="deleteOption" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Account</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="confirmpassword"
                  :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showpassword ? 'text' : 'password'"
                  label="Confirm password to delete account"
                  @click:append="showpassword = !showpassword"
                  prepend-icon="mdi-lock"
                  @keyup.enter="deleteAccount"
                ></v-text-field>
              <v-alert
              v-if="status != null"
              :type="status.type"
              outlined
              text
              :icon="status.icon"
              transition="scale-transition"
              >{{status.message}}</v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions style="background-color:#1976d2">
          <v-spacer></v-spacer>
          <v-btn color="white" text @click="deleteOption = false">Close</v-btn>
          <v-btn color="white" text @click="deleteAccount">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-toolbar>
</template>

<script>
import { mapGetters } from "vuex";
import firebase from "firebase";

export default {
  name: "Toolbar",
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  data() {
    return {
      status: null,
      confirmpassword: "",
      showpassword: false,
      deleteOption: false,
      enableOptions: false,
      db: firebase.firestore()
    };
  },
  methods: {
    signOut() {
      firebase.auth().signOut().then(() => 
      {
        if (this.$route.name !== "forums") 
        {
          console.log(this.user)
          this.$router.replace(
          {
            name: "forums"
          });
        }
        });
    },
    deleteAccount() 
    {
      this.enableOptions = false
      this.db.collection('users').doc(this.user.data.email).get().then((userProfile) =>
      {
        if(userProfile.data().numEntries == 0)
        {
          let user = firebase.auth().currentUser
          var credential = firebase.auth.EmailAuthProvider.credential(user.email, this.confirmpassword)
          user.reauthenticateWithCredential(credential).then(() => 
          {
            this.db.collection("users").doc(user.email).delete().then(() => 
            {
              console.log("User account deleted")
              user.delete().then(() => 
              {
                console.log("User account deleted")
                let deleteAccountStatus  = 
                {
                    type: 'success',
                    message: 'Your account was deleted successfully',
                    icon: 'mdi-checkbox-marked-circle-outline'
                }
                this.showStatus(deleteAccountStatus)
              }).catch((error) => 
              {
                let deleteAccountStatus  = 
                {
                    type: 'error',
                    message: error.message,
                    icon: 'mdi-skull-outline'
                }
                this.showStatus(deleteAccountStatus)
              })
            }).catch((error)=>
            {
              let deleteAccountStatus  = 
              {
                  type: 'error',
                  message: error.message,
                  icon: 'mdi-skull-outline'
              }
              this.showStatus(deleteAccountStatus)
            })
          }).catch((error) => 
          {
            let deleteAccountStatus  = 
            {
                type: 'error',
                message: error.message,
                icon: 'mdi-skull-outline'
            }
            this.showStatus(deleteAccountStatus)
          })
        }
        else
        {
          let deleteAccountStatus  = 
          {
              type: 'error',
              message: "Accounts with entries can't be deleted",
              icon: 'mdi-skull-outline'
          }
          this.showStatus(deleteAccountStatus)
        }
      }).catch(error =>
      {
        let deleteAccountStatus  = 
        {
            type: 'error',
            message: error.message,
            icon: 'mdi-skull-outline'
        }
        this.showStatus(deleteAccountStatus)
      }).finally(() =>
      {
        this.confirmpassword = ""
        this.showpassword = false;
      })
    },
    editAccount(){
      this.enableOptions = false
      this.$router.replace(
      {
        name: "updateAccount"
      });
    },
    showStatus(status)
    {
      this.status = status
      if(status.type === "error")
      {
        setTimeout(() => {this.status = null}, 3000);
      }
      else if(status.type === "success")
      {
        setTimeout(() => {this.status = null; this.deleteOption = false}, 3000);
      }
    }
  }
};
</script>

<style scoped>
.v-alert {
    margin-bottom: 0;
}
.container {
    padding-bottom: 0;
}
.theme--dark.v-toolbar.v-sheet {
    max-height: fit-content;
}
</style>
