import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  container: { flex: 1, padding: 20,  marginTop: 50, backgroundColor: '#fff' },
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 8 },
  item: { marginBottom: 12, padding: 10, borderBottomWidth: 0.5 },
  name: { fontSize: 16},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6, // optional, if supported
},
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: 'white', padding: 40, borderRadius: 10, width: '80%',
  },
  
  listItemSearch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },

  
  listItem: {
    flexDirection: 'column',
    marginTop: 5,
    alignItems: 'center',
  },
});
