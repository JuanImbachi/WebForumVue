<template>
  <div id="app">
    <v-app class="LoginDiv">
      <v-layout justify-center>
        <v-flex xs14 sm12 md10>
          <v-dialog v-model="status" persistent max-width="600px">
            <v-alert
              v-if="status != null"
              :type="status.type"
              outlined
              text
              :icon="status.icon"
              transition="scale-transition"
              >{{status.message}}</v-alert>
          </v-dialog>
          <v-card class="elevation-12" style="margin-bottom: 5%">
            <v-toolbar color="primary" dark flat align-center>
              <v-btn to="/forums" icon>
                <v-icon x-large>mdi-arrow-left-circle</v-icon>
              </v-btn>
              <v-spacer />
              <v-toolbar-title class="toolbarTitle">{{forum.title}}</v-toolbar-title>
              <v-spacer />
            </v-toolbar>
            <v-card-subtitle>
              <v-row style="margin:0px">
                <v-col cols="6">
                  <b>Creation Date:</b>
                  {{forum.creation_date | formatDate}}
                </v-col>
                <v-col cols="6">
                  <b>Creator:</b>
                  {{forum.creator.id}}
                </v-col>
              </v-row>
              <hr />
            </v-card-subtitle>
            <v-card-text>
              <h3 align="left">Subject:</h3>
              <div class="content">
                <p align="justify">{{forum.subject}}</p>
              </div>
              <v-divider></v-divider>
              <h3 align="left">Posdata:</h3>
              <div class="content">
                <v-textarea
                :rules="postdataRules"
                v-model="forum.postdata"
                :disabled="!edit"
                cleareable
                no-resize
                rows="3"
              >{{forum.postdata}}</v-textarea>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-icon medium color="white" left v-if="verifyOwnership(forum.creator.id) && !edit" @click="edit = !edit">mdi-circle-edit-outline</v-icon>
              <v-icon medium color="#59FF33" left v-if="edit" @click="save">mdi-check-circle-outline</v-icon>
              <v-icon large color="white" rigth @click="reply = true">mdi-reply-all</v-icon>
            </v-card-actions>
          </v-card>

          <entry v-for="entry in forum.entries" :key="entry.id" :entry="entry" @refreshForum="refresh" @showStatus="showStatus"></entry>
            
            <v-row justify="center">
              <v-dialog v-model="reply" persistent max-width="600px">
                <v-card>
                  <v-card-title>
                    <span class="headline">Reply</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" md="12">
                          <v-textarea
                            outlined
                            :counter="300"
                            label="Subject"
                            :rules="subjectRules"
                            v-model="replySubject"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-container>
                    <small>*indicates required field</small>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="white" text @click="reply = false">Close</v-btn>
                    <v-btn color="white" text @click="replyToForum">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-row>
        </v-flex>
      </v-layout>
    </v-app>
  </div>
</template>

<script>
import firebase from "../config/firebase";
import { mapGetters } from "vuex";
import entry from "../Views/Entry";

export default {
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  data() {
    return {
      edit: false,
      reply: false,
      replySubject: "",
      db: firebase.firestore(),
      status: null,
      forum: {
        title: "",
        subject: "",
        creation_date: "",
        entries: [],
        creator: "",
        postdata: ""
      },
      subjectRules: 
      [
        subject => !!subject || "Subject is required",
        subject => subject.length <= 300 || "Subject must be less than 300 characters"
      ],
      postdataRules: 
      [
        postdata => postdata.length <= 300 || "Postdata must be less than 300 characters"
      ]
    };
  },
  methods: {
    replyToForum() 
    {
      if (this.user) 
      {
        this.db.collection("params").doc("lastEntryId").get().then(lastEntryId => 
        {
          let newEntryId = (parseInt(lastEntryId.data().value) + 1).toString();
          this.db.collection("entries").doc(newEntryId).set(
          {
              creation_date: new Date(Date.now()),
              id: newEntryId,
              creator: this.db.doc("users/" + this.user.data.email),
              parent: this.db.doc("entries/" + this.forum.id),
              subject: this.replySubject
          }).then(() => 
          {
            this.db.collection('users').doc(this.user.data.email).update(
            {
              numEntries: firebase.firestore.FieldValue.increment(1)
            });
            this.db.collection("params").doc("lastEntryId").set(
            {
                value: newEntryId
            });
            this.reply = false
            let replyStatus  = 
            {
                type: 'success',
                message: 'Your reply was posted successfully',
                icon: 'mdi-checkbox-marked-circle-outline'
            }
            this.refresh()

            this.showStatus(replyStatus)
            this.replySubject = ""
          }).catch(function(error) {
              // let replyStatus  = 
              // {
              //     type: 'error',
              //     message: error.message,
              //     icon: 'mdi-skull-outline'
              // }
              // this.showStatus(replyStatus)
              alert(error.message)
              this.replySubject = ""
          });                
          
        });
      }
    },
    refresh() {
      this.db.collection("entries").get().then(entries => 
      {
          let forumEntries = [];
          entries.forEach(entry => 
          {
            if (entry.data().id === this.$route.params.id) 
            {
              this.forum = entry.data();
            } 
            else if (entry.data().parent !== null && entry.data().parent.id === this.$route.params.id) 
            {
              forumEntries.push(entry.data());
            }
          });
          this.forum.entries = forumEntries.sort(function(a, b) {
            return a.creation_date - b.creation_date
          });
      }).catch(error => 
      {
        console.log(error.message)
      })
    },
    orderByNumber(property, sortOrder) {
      if (sortOrder != -1 && sortOrder != 1) sortOrder = 1;
      this.sort(function(a, b) {
        return (a[property] - b[property]) * sortOrder;
      });
    },
    showStatus(status)
    {
      this.status = status
      setTimeout(() => this.status = null, 3000);
    },
    save() 
    {
      let editStatus = null
      this.db.collection("entries").doc(this.forum.id).set(
      {
        postdata: this.forum.postdata
      },
      { 
        merge: true 
      }).then(() =>
      {
        editStatus  = 
        {
            type: 'success',
            message: 'Your forum was updated',
            icon: 'mdi-checkbox-marked-circle-outline'
        }
      }).catch(function(error) 
      {
        editStatus = 
        {
          type: "error",
          message: error.message,
          icon: "mdi-skull-outline"
        }
      });
      this.edit = false
      this.showStatus(editStatus)
    },
    verifyOwnership(creatorEmail) 
    {
      console.log("Logged: " + this.user.data.email)
      return this.user.data.email === creatorEmail;
    }
  },
  mounted: function() {
    this.refresh();
  },
  filters: {
    formatDate: function(value) {
      if (!value) return "";
      return new Date(value.seconds * 1000).toLocaleDateString("es-ES");
    }
  },
  components: {
    entry
  }
};
</script>

<style scoped>
.toolbarTitle {
  font-size: 180%;
}
.col {
  padding: 0px;
}
.v-card__actions {
  padding: 0px;
  background: #1976d2;
}
.content{
  margin: 1% 3% 2% 3%;
}
</style>