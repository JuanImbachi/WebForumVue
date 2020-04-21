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
                  {{entry.creator}}
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
            <v-spacer></v-spacer>
            <v-icon v-if="verifyEdit(entry.creator) && !edit" @click="edit = !edit">mdi-tooltip-edit-outline</v-icon>
            <v-icon color="green" v-if="edit" @click="save">mdi-check-circle-outline</v-icon>
          </v-card-actions>
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
  filters: {
    formatDate: function(value) {
      if (!value) return "";
      return new Date(value.seconds * 1000).toLocaleDateString("es-ES");
    }
  },
  methods: {
    verifyEdit(creatorEmail) {
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
    }
  }
};
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
</style>