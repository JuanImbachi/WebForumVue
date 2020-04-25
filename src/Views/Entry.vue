<template>
  <div id="app">
    <v-layout justify-center>
      <v-flex xs14 sm12 md10>
        <v-card class="elevation-4" style="margin: 2% 0 ">
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
            <v-spacer></v-spacer>
            <v-icon left v-if="verifyOwnership(entry.creator.id) && !edit" @click="edit = !edit">mdi-circle-edit-outline</v-icon>
            <v-icon left color="#59FF33" v-if="edit" @click="save">mdi-check-circle-outline</v-icon>
            <v-icon rigth  @click="reply = true">mdi-reply-all</v-icon>
          </v-card-actions>

          <v-expansion-panels
      :accordion="accordion"
      :popout="popout"
      :inset="inset"
      :multiple="true"
      :focusable="focusable"
      :disabled="disabled"
      :readonly="readonly"
      :flat="flat"
      :hover="hover"
      :tile="tile"
    >
      <v-expansion-panel
        v-for="(item,i) in 2"
        :key="i"
      >
        <v-expansion-panel-header>Item</v-expansion-panel-header>
        <v-expansion-panel-content>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
        </v-card>
        
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import firebase from "../config/firebase";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      db: firebase.firestore(),
      edit: false,
      editStatus: null,
      subjectRules: 
      [
        subject => !!subject || "Subject is required",
        subject =>
        subject.length <= 300 || "Title must be less than 300 characters"
      ]
    };
  },
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
    verifyOwnership(creatorEmail) {
      return this.user.data.email === creatorEmail;
    },
    save() 
    {
      this.db.collection("entries").doc(this.entry.id).set(
        {
          subject: this.entry.subject
        },{ merge: true })
        .catch(function(error) {
          let editStatus = {
            type: "error",
            message: error.message,
            icon: "mdi-skull-outline"
          }
          this.$emit('showStatus', editStatus)
        });
        this.edit = false
        if(this.editStatus === null)
        {
            let editStatus  = 
            {
                type: 'success',
                message: 'Your reply was posted successfully',
                icon: 'mdi-checkbox-marked-circle-outline'
            }
            this.$emit('refresh')
            this.$emit('showStatus', editStatus)
        }
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
.v-card__actions {
 background: #dce0e4b2
}
</style>