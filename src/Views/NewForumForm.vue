<template>
  <div id="app">
    <v-card class="elevation-12">
      <v-toolbar color="primary" dark flat align-center>
        <v-btn @click="closeForum" icon>
                <v-icon x-large>mdi-arrow-left-circle</v-icon>
          </v-btn>
        <v-spacer />
        <v-toolbar-title class="toolbarTitle">New Forum</v-toolbar-title>
        <v-spacer />
      </v-toolbar>
      <v-card-text>
        <v-form v-model="valid">
          <v-col cols="12" md="12">
          <v-text-field
          
            label="Forum Title"
            type="text"
            :counter="100"
            v-model="title"
            :rules="titleRules"
          ></v-text-field>
          </v-col>
        <v-col cols="12" md="12">
          <v-textarea
            outlined
            label="Forum Subject"
            :rules="subjectRules"
            v-model="subject"
          ></v-textarea>
        </v-col>
        </v-form>
        <v-spacer>
          <v-btn type="submit" :disabled="!valid" outlined color="primary" @click="addForum">
            <v-icon>mdi-login-variant</v-icon>
          </v-btn>
        </v-spacer>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import firebase from "../config/firebase";

export default {
  name: "newforumform",
  data() {
    return {
      newForumStatus: null,
      db: firebase.firestore(),
      valid: true,
      title: "",
      subject: "",
      titleRules: [
        title => !!title || "Title is required",
        title => title.length <= 100 || "Title must be less than 100 characters"
      ],
      subjectRules: [
        subject => !!subject || "Subject is required",
        ]
    };
  },
  methods: {
    closeForum(){
      this.$emit("closeForumForm")
    },
    addForum() {
      let user = firebase.auth().currentUser;
      if (user) {
        this.db.collection("params").doc("lastEntryId").get().then(lastEntryId => 
        {
            let newEntryId = (
              parseInt(lastEntryId.data().value) + 1).toString();
              this.db.collection("entries").doc(newEntryId).set(
              {
                  creation_date: new Date(Date.now()),
                  id: newEntryId,
                  creator: this.db.collection('users').doc(user.email),
                  parent: null,
                  title: this.title,
                  subject: this.subject,
                  postdata: ""
              }).then(() => 
              {
                this.db.collection('users').doc(user.email).update(
                {
                  numEntries: firebase.firestore.FieldValue.increment(1)
                });
              }).catch(function(error) 
              {
                this.newForumStatus  = 
                {
                  type: 'error',
                  message: error.message,
                  icon: 'mdi-skull-outline'
                }
              });                
                this.title = ""
                this.subject = ""
                if(this.newForumStatus === null)
                {
                  this.db.collection("params").doc("lastEntryId").set(
                  {
                    value: newEntryId
                  });
                  this.$emit("notifyNewForum")
                  this.newForumStatus  = 
                  {
                    type: 'success',
                    message: 'The forum was created successfully',
                    icon: 'mdi-checkbox-marked-circle-outline'
                  }
                }
                this.$emit("notifyNewForumStatus", this.newForumStatus)
          });
      }
    }
  }
};
</script>

<style scoped>
.toolbarTitle {
  font-size: 180%;
}
</style>