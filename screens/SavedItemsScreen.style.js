import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  container: { flex: 1, padding: 20,  marginTop: 50, backgroundColor: '#252222ff' },
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 8 },
  item: { marginBottom: 12, padding: 10, borderBottomWidth: 0.5 },
  name: { fontSize: 16,    color: '#fff',},
  name_search : {fontSize:16,     color : '#000000ff',},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6, // optional, if supported
    fontWeight: '100',
},
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: 'white', padding: 40, borderRadius: 10, width: '90%',
    maxHeight: '80%',
  },
  
  listItemSearch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  roundButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  
  listItem: {
    flexDirection: 'column',
    marginTop: 5,
    alignItems: 'center',
  },
});
