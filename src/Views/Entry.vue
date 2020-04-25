<template>
    <v-layout justify-center>
      <v-flex xs14 sm12 md10>
        <v-card class="elevation-1" style="margin: 2% 0 ">
          <v-card-text>
            <div class="forumDetails">
              <v-row style="margin:0px">
                <v-col cols="6">
                  <b>Creation Date:</b>
                  {{entry.creation_date | formatDate}}
                </v-col>
                <v-col cols="6">
                  <b>Creator:</b>
                  {{entry.creator.id}}
                </v-col>
              </v-row>
              <hr />
            </div>
            <div class="forumSubject"></div>
            <v-textarea
              :rules="subjectRules"
              v-model="entry.subject"
              :disabled="!edit"
              cleareable
              no-resize
              rows="3"
            >{{entry.subject}}</v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-icon left color="red" v-if="verifyOwnership(entry.creator.id)" @click="deleteEntry(entry.id)">mdi-trash-can-outline</v-icon>
            <v-btn  small  text @click="loadReplies">
              <v-icon>{{ showReplies ? 'mdi-minus' : 'mdi-plus' }}</v-icon> Replies
            </v-btn>
            <v-spacer></v-spacer>
            
            <v-icon left v-if="verifyOwnership(entry.creator.id) && !edit" @click="edit = !edit">mdi-circle-edit-outline</v-icon>
            <v-icon left color="#59FF33" v-if="edit" @click="save">mdi-check-circle-outline</v-icon>
            <v-btn text fab>
            <v-icon rigth  @click="reply = true">mdi-reply-all</v-icon></v-btn>
          </v-card-actions>

            <v-expansion-panels multiple focusable flat tile v-if="showReplies">

            <v-expansion-panel v-for="(answer, index) in answers" :key="index">

              <v-expansion-panel-header>
                  <v-row style="margin:0px">
                    <v-col cols="4">
                      <b>From:</b>
                      {{answer.creatorProfile.name}} {{answer.creatorProfile.lastname}}
                    </v-col>
                </v-row>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <entry  :entry="answer" @refresh="refresh" @showStatus="showStatus" @loadRepliesParent="loadReplies"></entry>
              </v-expansion-panel-content>

            </v-expansion-panel>

          </v-expansion-panels>

        </v-card>
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
                  </v-card-text>
                  <v-card-actions class="reply">
                    <v-spacer></v-spacer>
                    <v-btn color="white" text @click="reply = false">Close</v-btn>
                    <v-btn color="white" text @click="replyToEntry">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-row>
      </v-flex>
    </v-layout> 
</template>

<script>
import firebase from "../config/firebase";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      showReplies: false,
      db: firebase.firestore(),
      edit: false,
      reply: false,
      replySubject: "",
      answers:[],
      subjectRules: 
      [
        subject => !!subject || "Subject is required",
        subject =>
        subject.length <= 300 || "Title must be less than 300 characters"
      ]
    };
  },
  name:"entry",
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  props: ["entry"],
  filters: 
  {
    formatDate: function(value) {
      if (!value) return "";
      return new Date(value.seconds * 1000).toLocaleDateString("es-ES");
    }
  },
  methods: 
  {
    loadReplies(){
      this.showReplies = !this.showReplies
      if(this.showReplies)
      {
        this.answers = []
        let docRef = this.db.collection("entries").doc(this.entry.id);
        
        this.db.collection("entries").where("parent","==",docRef).get().then((entries)=>
        {
          entries.forEach(entry => 
          {
            this.db.collection('users').doc(entry.data().creator.id).get().then((user) =>
            {
              let finalEntry = {
                creation_date: entry.data().creation_date,
                id: entry.data().id,
                creator: entry.data().creator,
                parent: entry.data().parent,
                subject: entry.data().subject,
                creatorProfile: user.data()
              }
              this.answers.push(finalEntry)
            })
          });
          this.answers.sort(function(a, b) {
            return a.id - b.id
          });
        })
      }
    },
    verifyOwnership(creatorEmail) {
      return this.user.data.email === creatorEmail;
    },
    save() 
    {
      this.db.collection("entries").doc(this.entry.id).set(
      {
        subject: this.entry.subject
      },
      { 
        merge: true 
      }).then(() => 
      {
        let editStatus  = 
        {
            type: 'success',
            message: 'Your reply was updated successfully',
            icon: 'mdi-checkbox-marked-circle-outline'
        }
        this.$emit('refresh')
        this.$emit('showStatus', editStatus)
      }).catch(function(error) 
      {
        let editStatus = 
        {
          type: "error",
          message: error.message,
          icon: "mdi-skull-outline"
        }
        this.$emit('showStatus', editStatus)
      });
      this.edit = false
    },
    deleteEntry(entryId) 
    {
      this.db.collection("entries").get().then(entries => 
      {
        let deletable = true;
        for (let index = 0; index < entries.docs.length && deletable; index++) 
        {
          const entry = entries.docs[index];
          if(entry.data().parent != null && entry.data().parent.id === entryId)
          {
            deletable = false
          }
        }
        if (deletable) 
        {
          this.db.collection("entries").doc(entryId).delete().then(() => 
          {
              console.log("Document successfully deleted!");
              this.db.collection('users').doc(this.user.data.email).update(
              {
                numEntries: firebase.firestore.FieldValue.increment(-1)
              });
              this.$emit('refresh')
              let deleteStatus  = 
              {
                type: 'success',
                message: "Your reply was deleted",
                icon: 'mdi-checkbox-marked-circle-outline'
              }
              this.$emit('showStatus', deleteStatus)
              this.$emit('refreshForum')
          }).catch(function(error) 
          {
            console.error("Error removing document: ", error);
          });
        } 
        else 
        {
          let deleteStatus  = 
          {
            type: 'error',
            message: "Entries with replies can't be deleted",
            icon: 'mdi-skull-outline'
          }
          this.$emit('showStatus', deleteStatus)
        }
      });
    },
    replyToEntry() 
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
              parent: this.db.doc("entries/" + this.entry.id),
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
            this.showReplies = false
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
              alert(error.message)
              this.replySubject = null

          });                
        })
      }
    },
    refresh()
    {
      this.loadReplies()
    },
    showStatus(replyStatus)
    {
      this.$emit('showStatus', replyStatus)
    }
  }
}
</script>

<style scoped>
.forumsDetails {
  text-align: left;
}
.forumSubject {
  margin-top: 2%;
}
.col {
  padding: 0px;
}
.v-card__actions.reply {
  padding: 0px;
  background: #1976d2;
}
</style>